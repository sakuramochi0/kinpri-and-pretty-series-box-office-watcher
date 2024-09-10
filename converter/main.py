import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict

import numpy as np
import pandas as pd
import zenhan

FILM_NAME = 'KING OF PRISM'
TICKET_PRICE = 1800 # assume all the ticket is normal special ticket price

OUTPUT_FILE_BASENAME = 'kinpri-dramatic-prism-1'
CSV_FILENAME = f'../data/converted/{OUTPUT_FILE_BASENAME}.csv'
JSON_FILENAME = f'../data/converted/{OUTPUT_FILE_BASENAME}.json'


def main():
    records = []
    for filename in sorted(Path('../data/raw/').glob('*.json'), key=lambda x: x):
        if '（独立系を含む）デイリー合算ランキング' in filename.name:
            print(filename)
            record = pick_up_target_film_record(filename)
            records.append(record)
    df = pd.json_normalize(records)

    df['record.cumulative_sales'] = df['record.sales'].cumsum()
    df['record.estimated_box_office'] = df['record.cumulative_sales'] * TICKET_PRICE

    df.to_csv(CSV_FILENAME, index=False)

    data = {
        'updated': datetime.now().isoformat(),
        'records': df_to_formatted_json(df),
    }
    with open(JSON_FILENAME, 'w') as f:
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
    for raw_record in body[2:]:
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

    if not records:
        return None

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


def make_formatted_dict(my_dict, key_arr, val):
    """
    Set val at path in my_dict defined by the string (or serializable object) array key_arr
    ref. https://stackfame.com/inverse-of-pandas-json_normalize-or-json_denormalize-python-pandas
    """
    current = my_dict
    for i in range(len(key_arr)):
        key = key_arr[i]
        if key not in current:
            if i == len(key_arr) - 1:
                if type(val) is not str and np.isnan(val):
                    current[key] = None
                else:
                    current[key] = val
            else:
                current[key] = {}
        else:
            if type(current[key]) is not dict:
                print("Given dictionary is not compatible with key structure requested")
                raise ValueError("Dictionary key already occupied")
        current = current[key]
    return my_dict


def df_to_formatted_json(df, sep="."):
    """
    ref. https://stackfame.com/inverse-of-pandas-json_normalize-or-json_denormalize-python-pandas
    """
    result = []
    for _, row in df.iterrows():
        parsed_row = {}
        for idx, val in row.items():
            keys = idx.split(sep)
            parsed_row = make_formatted_dict(parsed_row, keys, val)
        result.append(parsed_row)
    return result


if __name__ == '__main__':
    main()
