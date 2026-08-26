#!/usr/bin/env python3
"""Recover files from ZIP local headers when the archive tail is missing."""

from __future__ import annotations

import argparse
import binascii
import json
from pathlib import Path, PurePosixPath
import struct
import sys
import zlib

LOCAL_FILE_HEADER = b"PK\x03\x04"
CENTRAL_DIRECTORY = b"PK\x01\x02"
END_OF_CENTRAL_DIRECTORY = b"PK\x05\x06"
ZIP64_END = b"PK\x06\x06"
ZIP64_LOCATOR = b"PK\x06\x07"


def safe_destination(root: Path, archive_name: str) -> Path:
    relative = PurePosixPath(archive_name)
    if relative.is_absolute() or not relative.parts or ".." in relative.parts:
        raise ValueError(f"Unsafe archive path: {archive_name!r}")
    return root.joinpath(*relative.parts)


def decode_content(method: int, compressed: bytes, archive_name: str) -> bytes:
    if method == 0:
        return compressed
    if method == 8:
        return zlib.decompress(compressed, -zlib.MAX_WBITS)
    raise ValueError(
        f"Unsupported ZIP compression method {method} for {archive_name!r}"
    )


def decode_partial_content(method: int, compressed: bytes, archive_name: str) -> bytes:
    if method == 0:
        return compressed
    if method == 8:
        decompressor = zlib.decompressobj(-zlib.MAX_WBITS)
        return decompressor.decompress(compressed) + decompressor.flush()
    raise ValueError(
        f"Unsupported ZIP compression method {method} for {archive_name!r}"
    )


def recover(
    source: Path, destination: Path, allow_partial: bool
) -> tuple[list[str], list[dict[str, int | str]]]:
    payload = source.read_bytes()
    destination.mkdir(parents=True, exist_ok=True)

    cursor = 0
    extracted: list[str] = []
    partial_entries: list[dict[str, int | str]] = []

    while cursor < len(payload):
        signature = payload[cursor : cursor + 4]
        if signature in {
            CENTRAL_DIRECTORY,
            END_OF_CENTRAL_DIRECTORY,
            ZIP64_END,
            ZIP64_LOCATOR,
        }:
            break

        if signature != LOCAL_FILE_HEADER:
            next_header = payload.find(LOCAL_FILE_HEADER, cursor + 1)
            if next_header < 0:
                break
            cursor = next_header

        if cursor + 30 > len(payload):
            raise ValueError(
                f"Truncated ZIP local header at byte {cursor}; archive has {len(payload)} bytes"
            )

        (
            _signature,
            _version_needed,
            flags,
            method,
            _modified_time,
            _modified_date,
            expected_crc,
            compressed_size,
            uncompressed_size,
            name_length,
            extra_length,
        ) = struct.unpack_from("<IHHHHHIIIHH", payload, cursor)

        if flags & 0x01:
            raise ValueError("Encrypted ZIP entries are not supported")
        if flags & 0x08:
            raise ValueError("ZIP data descriptors are not supported")

        name_start = cursor + 30
        name_end = name_start + name_length
        data_start = name_end + extra_length
        encoding = "utf-8" if flags & 0x0800 else "cp437"
        archive_name = payload[name_start:name_end].decode(encoding)
        output_path = safe_destination(destination, archive_name)
        data_end = data_start + compressed_size

        if data_end > len(payload):
            available = payload[data_start:]
            shortage = data_end - len(payload)
            message = (
                f"Truncated compressed ZIP entry {archive_name!r}: expected "
                f"{compressed_size} compressed bytes, found {len(available)}; "
                f"missing {shortage} bytes"
            )
            if not allow_partial:
                raise ValueError(message)

            content = decode_partial_content(method, available, archive_name)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(content)
            extracted.append(archive_name)
            partial_entries.append(
                {
                    "name": archive_name,
                    "compressed_expected": compressed_size,
                    "compressed_recovered": len(available),
                    "uncompressed_expected": uncompressed_size,
                    "uncompressed_recovered": len(content),
                    "compressed_missing": shortage,
                }
            )
            print("WARNING: " + message, file=sys.stderr)
            break

        compressed = payload[data_start:data_end]
        content = decode_content(method, compressed, archive_name)

        if len(content) != uncompressed_size:
            raise ValueError(f"Size mismatch while recovering {archive_name!r}")

        actual_crc = binascii.crc32(content) & 0xFFFFFFFF
        if actual_crc != expected_crc:
            raise ValueError(f"CRC mismatch while recovering {archive_name!r}")

        if archive_name.endswith("/"):
            output_path.mkdir(parents=True, exist_ok=True)
        else:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(content)
            extracted.append(archive_name)

        cursor = data_end

    if not extracted:
        raise ValueError("No recoverable ZIP entries were found")

    report = {
        "source_bytes": len(payload),
        "extracted": extracted,
        "partial_entries": partial_entries,
    }
    (destination / "recovery-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return extracted, partial_entries


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--require", action="append", default=[])
    parser.add_argument("--allow-partial", action="store_true")
    args = parser.parse_args()

    try:
        extracted, partial_entries = recover(
            args.source, args.destination, args.allow_partial
        )
        missing = sorted(set(args.require).difference(extracted))
        if missing:
            raise ValueError(f"Required recovered files are missing: {missing}")
    except (OSError, ValueError, zlib.error, UnicodeError, struct.error) as exc:
        print(f"ZIP recovery failed: {exc}", file=sys.stderr)
        return 1

    print("Recovered files: " + ", ".join(extracted))
    if partial_entries:
        print("Partial files: " + ", ".join(str(item["name"]) for item in partial_entries))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
