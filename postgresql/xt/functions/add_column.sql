create or replace function xt.add_column(table_name text, column_name text, type_name text, constraint_text text default null, schema_name text default 'xt') returns boolean volatile as $$
-- Copyright (c) 1999-2011 by OpenMFG LLC, d/b/a xTuple. 
-- See www.xm.ple.com/CPAL for the full text of the software license.
declare
  count integer;
  query text;
begin

  perform *
  from pg_class c, pg_namespace n, pg_attribute a, pg_type t
  where c.relname = table_name
   and n.nspname = schema_name
   and a.attname = column_name
   and n.oid = c.relnamespace
   and a.attnum > 0
   and a.attrelid = c.oid
   and a.atttypid = t.oid;
  
  get diagnostics count = row_count;
  
  if (count > 0) then
    return false;
  end if;

  query = 'alter table ' || schema_name || '.' || table_name || ' add column ' || column_name || ' ' || type_name || ' ' || coalesce(constraint_text, '');

  execute query;

  return true;
  
end;
$$ language 'plpgsql';
