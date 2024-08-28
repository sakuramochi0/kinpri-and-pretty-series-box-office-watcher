import json
import re
from pathlib import Path

import zenhan
import pandas as pd


def main():
    path = Path('../data/')
    for filename in path.glob('*.json'):
        print(filename)
        convert_json(filename)


def convert_json(filename: Path):
    with open(filename) as f:
        data = json.load(f)
    t = []
    for row in data['body'][2:-1]:
        rank, sales, total_seats, shows, theaters, since_last_week, name = map(clean_text, row.split(maxsplit=6))
        d = {
            'rank': rank,
            'sales': sales,
            'total_seats': total_seats,
            'shows': shows,
            'theaters': theaters,
            'since_last_week': since_last_week,
            'name': name,
        }
        t.append(d)
    df = pd.DataFrame.from_dict(t)
    df.to_csv(filename.with_suffix('.csv'), index=False)


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
        clean_text = re.sub(r'<div>.+</div>', '', clean_text) # JavaScript can insert <div> element
        return clean_text


if __name__ == '__main__':
    main()
