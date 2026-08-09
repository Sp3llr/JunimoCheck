alter table public.profiles
  drop constraint if exists profiles_avatar_key_check;

alter table public.profiles
  add constraint profiles_avatar_key_check check (avatar_key in (
    'abigail', 'alex', 'caroline', 'clint', 'demetrius', 'dwarf', 'elliott',
    'emily', 'evelyn', 'george', 'gus', 'haley', 'harvey', 'jas', 'jodi',
    'kent', 'krobus', 'leah', 'leo', 'lewis', 'linus', 'marnie', 'maru',
    'pam', 'penny', 'pierre', 'robin', 'sam', 'sandy', 'sebastian', 'shane',
    'vincent', 'willy', 'wizard'
  ));
