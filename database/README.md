# Database

## Setup
Create a `.env` file in the `database` folder, and add `SUPABASE_KEY="<key>"`. Contact Vash for the API key. 

### Python
Inside of a venv, run `pip install supabase dotenv`.

## Run code

### TypeScript
Run `npm run dev` to run the test file that adds two rows to the Topics database, then queries them.

### Python
Click run button in IDE or run `python3 <path/to/test.py>`. The `test.py` file simply adds a row to the database. 

## TODO
* Configure Row Level Security (RLS) policies on the Topics table for security.