import json
import re
from pathlib import Path

import zenhan
import pandas as pd


def main():
    path = Path('../data/raw/')
    for filename in path.glob('*.json'):
        print(filename)
        df = convert_json(filename)
        new_filename = Path('../data/converted/').joinpath(filename.name)
        df.to_json(new_filename, orient='records', indent=2, force_ascii=False)


def convert_json(filename: Path) -> pd.DataFrame:
    with open(filename) as f:
        data = json.load(f)
    records = []

    for raw_record in data['body'][2:-1]:
        rank, sales, total_seats, shows, theaters, since_last_week, name = map(clean_text, raw_record.split(maxsplit=6))
        record = {
            'rank': rank,
            'sales': sales,
            'total_seats': total_seats,
            'shows': shows,
            'theaters': theaters,
            'since_last_week': since_last_week,
            'name': name,
        }
        records.append(record)

    return pd.DataFrame.from_records(records)


def clean_text(text):
    """Remove non-number characters and convert it to int type."""

    # remove bad characters
    clean_text = text.replace('*', '').replace('　', ' ')
    try:
        # for integer string like '1234'
        return int(clean_text)
    except:
        # for percentile string like '12.3%'
        if clean_text.endswith('%'):
            return float(clean_text.replace('%', ''))

        # for film name
        clean_text = zenhan.z2h(clean_text, mode=zenhan.ASCII | zenhan.DIGIT)
        clean_text = re.sub(r'<div>.+</div>', '', clean_text)  # JavaScript can insert <div> element
        return clean_text


if __name__ == '__main__':
    main()
