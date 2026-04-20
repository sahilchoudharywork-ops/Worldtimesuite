export interface TimezoneCode {
  slug: string;      // used in URL e.g. "est"
  code: string;      // display code e.g. "EST"
  name: string;      // full name e.g. "Eastern Standard Time"
  iana: string;      // IANA identifier e.g. "America/New_York"
}

export const TIMEZONE_CODES: TimezoneCode[] = [
  { slug: 'est',  code: 'EST',  name: 'Eastern Standard Time',              iana: 'America/New_York'    },
  { slug: 'pst',  code: 'PST',  name: 'Pacific Standard Time',              iana: 'America/Los_Angeles' },
  { slug: 'cst',  code: 'CST',  name: 'Central Standard Time',              iana: 'America/Chicago'     },
  { slug: 'mst',  code: 'MST',  name: 'Mountain Standard Time',             iana: 'America/Denver'      },
  { slug: 'ast',  code: 'AST',  name: 'Atlantic Standard Time',             iana: 'America/Halifax'     },
  { slug: 'brt',  code: 'BRT',  name: 'Brasília Time',                      iana: 'America/Sao_Paulo'   },
  { slug: 'gmt',  code: 'GMT',  name: 'Greenwich Mean Time',                iana: 'Europe/London'       },
  { slug: 'wet',  code: 'WET',  name: 'Western European Time',              iana: 'Europe/Lisbon'       },
  { slug: 'cet',  code: 'CET',  name: 'Central European Time',              iana: 'Europe/Berlin'       },
  { slug: 'cest', code: 'CEST', name: 'Central European Summer Time',       iana: 'Europe/Berlin'       },
  { slug: 'eet',  code: 'EET',  name: 'Eastern European Time',              iana: 'Europe/Athens'       },
  { slug: 'msk',  code: 'MSK',  name: 'Moscow Standard Time',               iana: 'Europe/Moscow'       },
  { slug: 'ist',  code: 'IST',  name: 'India Standard Time',                iana: 'Asia/Kolkata'        },
  { slug: 'gst',  code: 'GST',  name: 'Gulf Standard Time',                 iana: 'Asia/Dubai'          },
  { slug: 'sgt',  code: 'SGT',  name: 'Singapore Time',                     iana: 'Asia/Singapore'      },
  { slug: 'hkt',  code: 'HKT',  name: 'Hong Kong Time',                     iana: 'Asia/Hong_Kong'      },
  { slug: 'kst',  code: 'KST',  name: 'Korea Standard Time',                iana: 'Asia/Seoul'          },
  { slug: 'jst',  code: 'JST',  name: 'Japan Standard Time',                iana: 'Asia/Tokyo'          },
  { slug: 'aest', code: 'AEST', name: 'Australian Eastern Standard Time',   iana: 'Australia/Sydney'    },
  { slug: 'pht',  code: 'PHT',  name: 'Philippine Time',                    iana: 'Asia/Manila'         },
  { slug: 'nzdt', code: 'NZDT', name: 'New Zealand Daylight Time',          iana: 'Pacific/Auckland'    },
];

// Lookup by slug — used in routing and TimezoneConverter
export const TIMEZONE_BY_SLUG: Record<string, TimezoneCode> = 
  Object.fromEntries(TIMEZONE_CODES.map(tz => [tz.slug, tz]));

// All valid timezone slugs — used to detect timezone routes vs city routes
export const TIMEZONE_SLUGS = new Set(TIMEZONE_CODES.map(tz => tz.slug));

// Generate all permutations of timezone pairs (from ≠ to)
export const TIMEZONE_PAIR_ROUTES: string[] = [];
for (const from of TIMEZONE_CODES) {
  for (const to of TIMEZONE_CODES) {
    if (from.slug !== to.slug) {
      TIMEZONE_PAIR_ROUTES.push(`/${from.slug}-to-${to.slug}`);
    }
  }
}