import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

import zenhan
import pandas as pd

FILM_NAME = 'KING OF PRISM'
CONVERTED_JSON_FILENAME = 'kinpri-dramatic-prism-1.json'


def main():
    records = []
    for filename in Path('../data/raw/').glob('*.json'):
        print(filename)
        record = pick_up_target_film_record(filename)
        records.append(record)

    data = {
        'updated': datetime.now().isoformat(),
        'records': records,
    }

    new_filename = Path(f'../data/converted/{CONVERTED_JSON_FILENAME}')
    with open(new_filename, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def pick_up_target_film_record(filename: Path) -> Dict[str, Dict[str, int | float | str] | None]:
    """Choose first record of target film from json records."""

    with open(filename) as f:
        data = json.load(f)

    meta = make_meta(data)
    record = make_record(data['body'])

    return {
        'meta': meta,
        'record': record,
    }


def make_record(body) -> Dict[str, int | float | str] | None:
    """Make record field."""

    records = []
    for raw_record in body[2:-1]:
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
    df = pd.DataFrame.from_records(records)

    kinpri_record = df[df.name.str.contains(FILM_NAME)]
    if len(kinpri_record) == 0:
        return None
    return kinpri_record.iloc[0].to_dict()


def make_meta(data) -> Dict[str, str]:
    """Make meta data filed."""

    return {
        'url': data['url'],
        'title': data['title'],
        'record_date': get_record_date(data['title']),
        'last_updated': data['date'],
    }


def get_record_date(title: str) -> str:
    """Get date value for record from its title string."""

    date_str = re.search(r'\d{8}', title)[0]
    return datetime.strptime(date_str, '%Y%m%d').isoformat()


def clean_text(text) -> str | int | float:
    """Remove non-number characters and convert it to int type."""

    # remove bad characters
    clean_text = text.replace('*', '').replace('　', ' ')
    try:
        # for integer string like '1234'
        return int(clean_text)
    except ValueError:
        pass

    # for percentile string like '12.3%'
    if clean_text.endswith('%'):
        return float(clean_text.replace('%', ''))

    # for film name
    clean_text = zenhan.z2h(clean_text, mode=zenhan.ASCII | zenhan.DIGIT)
    clean_text = re.sub(r'<div>.+</div>', '', clean_text)  # JavaScript can insert <div> element
    return clean_text


if __name__ == '__main__':
    main()
