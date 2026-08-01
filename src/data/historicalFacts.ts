import type { HistoricalFact } from '@/types'

// A curated (not fully exhaustive) set of "this day in history" facts.
// Falls back to a generic encouragement message for uncovered dates.
export const HISTORICAL_FACTS: HistoricalFact[] = [
  { month: 1, day: 1, fact: 'The European Union introduced the euro currency in 1999.', category: 'politics', year: 1999 },
  { month: 1, day: 4, fact: 'Isaac Newton was born (Gregorian calendar) in 1643.', category: 'science', year: 1643 },
  { month: 1, day: 27, fact: 'Wolfgang Amadeus Mozart was born in 1756.', category: 'arts', year: 1756 },
  { month: 2, day: 3, fact: 'Buddy Holly, Ritchie Valens, and The Big Bopper died in a plane crash — "The Day the Music Died," 1959.', category: 'culture', year: 1959 },
  { month: 2, day: 11, fact: 'Thomas Edison, inventor of the phonograph and light bulb, was born in 1847.', category: 'technology', year: 1847 },
  { month: 2, day: 15, fact: 'Galileo Galilei was born in 1564.', category: 'science', year: 1564 },
  { month: 3, day: 14, fact: 'Albert Einstein was born in 1879.', category: 'science', year: 1879 },
  { month: 3, day: 20, fact: 'The first day of spring (vernal equinox) typically falls around this date in the Northern Hemisphere.', category: 'science' },
  { month: 4, day: 15, fact: 'The RMS Titanic sank in the North Atlantic in 1912.', category: 'culture', year: 1912 },
  { month: 4, day: 22, fact: 'The first Earth Day was celebrated in 1970.', category: 'culture', year: 1970 },
  { month: 4, day: 23, fact: 'William Shakespeare is traditionally celebrated as born on this day in 1564.', category: 'arts', year: 1564 },
  { month: 5, day: 29, fact: 'Edmund Hillary and Tenzing Norgay became the first to summit Mount Everest in 1953.', category: 'sports', year: 1953 },
  { month: 6, day: 28, fact: 'Google was founded in 1998.', category: 'technology', year: 1998 },
  { month: 7, day: 4, fact: 'The United States adopted the Declaration of Independence in 1776.', category: 'politics', year: 1776 },
  { month: 7, day: 14, fact: 'The storming of the Bastille took place in Paris in 1789.', category: 'politics', year: 1789 },
  { month: 7, day: 16, fact: 'Apollo 11 launched toward the Moon in 1969.', category: 'science', year: 1969 },
  { month: 7, day: 20, fact: 'Apollo 11 landed on the Moon and Neil Armstrong took his first steps in 1969.', category: 'science', year: 1969 },
  { month: 7, day: 21, fact: 'Ernest Hemingway was born in 1899.', category: 'arts', year: 1899 },
  { month: 8, day: 6, fact: 'Tim Berners-Lee published the first website in 1991.', category: 'technology', year: 1991 },
  { month: 8, day: 15, fact: 'The Woodstock music festival began in 1969.', category: 'culture', year: 1969 },
  { month: 9, day: 26, fact: 'Ivan the Terrible-era events aside, this date in 1983 saw Stanislav Petrov avert a false nuclear alarm.', category: 'politics', year: 1983 },
  { month: 10, day: 4, fact: 'The Soviet Union launched Sputnik 1, the first artificial satellite, in 1957.', category: 'science', year: 1957 },
  { month: 10, day: 24, fact: 'The United Nations was officially founded in 1945.', category: 'politics', year: 1945 },
  { month: 11, day: 9, fact: 'The Berlin Wall fell in 1989.', category: 'politics', year: 1989 },
  { month: 11, day: 30, fact: 'Mark Twain was born in 1835.', category: 'arts', year: 1835 },
  { month: 12, day: 10, fact: 'The first Nobel Prizes were awarded in Stockholm in 1901.', category: 'science', year: 1901 },
  { month: 12, day: 17, fact: 'The Wright brothers achieved the first powered flight in 1903.', category: 'technology', year: 1903 },
  { month: 12, day: 25, fact: 'Isaac Newton was born (Julian calendar) in 1642.', category: 'science', year: 1642 },
]

export function getHistoricalFact(date: Date): HistoricalFact | undefined {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return HISTORICAL_FACTS.find((f) => f.month === month && f.day === day)
}

export const FALLBACK_FACT_MESSAGES = [
  'Every session is a small piece of history you\'re writing yourself.',
  'No recorded event for this date yet — but today, you focused. That counts.',
  'History is made of ordinary days like this one, used well.',
]
