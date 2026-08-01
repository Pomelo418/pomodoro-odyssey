// One-off data seed generator: produces src/data/items.json (800 items, 100 per level).
// Run with: node src/scripts/generate-items.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Deterministic PRNG so the dataset is reproducible across runs.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260721)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const pickMany = (arr, n) => {
  const pool = [...arr]
  const out = []
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
  }
  return out
}
const weightedRarity = () => {
  const r = rng()
  if (r < 0.01) return 'golden'
  if (r < 0.15) return 'rare'
  if (r < 0.45) return 'uncommon'
  return 'common'
}

// ---------- LEVEL 1: FOOD ----------
const foodNames = [
  'Sushi', 'Ramen', 'Pad Thai', 'Pho', 'Tacos al Pastor', 'Paella', 'Neapolitan Pizza', 'Croissant',
  'Dim Sum', 'Kimchi Jjigae', 'Chicken Biryani', 'Pierogi', 'Poutine', 'Falafel', 'Hummus', 'Ceviche',
  'Empanada', 'Tiramisu', 'Gelato', 'Baklava', 'Shawarma', 'Currywurst', 'Fish and Chips', 'Butter Chicken',
  'Pad See Ew', 'Bibimbap', 'Tteokbokki', 'Bulgogi', 'Jollof Rice', 'Injera', 'Moussaka', 'Goulash',
  'Borscht', 'Pelmeni', 'Jiaozi Dumplings', 'Peking Duck', 'Mapo Tofu', 'Kung Pao Chicken', 'Char Siu',
  'Congee', 'Nasi Goreng', 'Beef Rendang', 'Chicken Satay', 'Laksa', 'Banh Mi', 'Spring Rolls', 'Samosa',
  'Tandoori Chicken', 'Garlic Naan', 'Chana Masala', 'Palak Paneer', 'Rogan Josh', 'Vindaloo', 'Gyoza',
  'Tempura', 'Okonomiyaki', 'Takoyaki', 'Onigiri', 'Miso Soup', 'Udon Noodles', 'Soba Noodles',
  'Katsu Curry', 'Shabu Shabu', 'Yakitori', 'Croque Monsieur', 'Ratatouille', 'Coq au Vin',
  'Beef Bourguignon', 'Quiche Lorraine', 'Crepes Suzette', 'Macarons', 'Escargot', 'Bouillabaisse',
  'Risotto alla Milanese', 'Lasagna', 'Spaghetti Carbonara', 'Margherita Pizza', 'Osso Buco',
  'Panna Cotta', 'Cannoli', 'Arancini', 'Focaccia', 'Bruschetta', 'Gazpacho', 'Tortilla Española',
  'Churros', 'Empanada Gallega', 'Mole Poblano', 'Guacamole', 'Quesadilla', 'Enchiladas Verdes',
  'Tamales', 'Chiles Rellenos', 'Pupusas', 'Arepas', 'Feijoada', 'Pão de Queijo', 'Churrasco',
  'Chimichurri Steak', 'Jerk Chicken', 'Roti', 'Poke Bowl', 'Loco Moco',
]
const difficulties = ['easy', 'medium', 'hard']

// Builds a { name: value } lookup from [value, [names...]] groups, so real
// dish/item names map to their actual cuisine/origin/culture instead of a
// value picked at random from a global pool (which previously produced
// nonsense like "Sushi — Ethiopian cuisine").
function buildMap(groups) {
  const map = {}
  for (const [value, names] of groups) {
    for (const name of names) map[name] = value
  }
  return map
}

// Warns (does not throw) about any source names missing from a lookup map,
// so gaps are caught by running the script rather than by manual counting.
function checkCoverage(names, map, label) {
  const missing = names.filter((n) => !(n in map))
  if (missing.length) {
    console.warn(`  [${label}] missing lookup for: ${missing.join(', ')}`)
  }
}

const FOOD_CUISINE = buildMap([
  ['Japanese', ['Sushi', 'Ramen', 'Gyoza', 'Tempura', 'Okonomiyaki', 'Takoyaki', 'Onigiri', 'Miso Soup', 'Udon Noodles', 'Soba Noodles', 'Katsu Curry', 'Shabu Shabu', 'Yakitori']],
  ['Thai', ['Pad Thai', 'Pad See Ew']],
  ['Vietnamese', ['Pho', 'Banh Mi', 'Spring Rolls']],
  ['Mexican', ['Tacos al Pastor', 'Mole Poblano', 'Guacamole', 'Quesadilla', 'Enchiladas Verdes', 'Tamales', 'Chiles Rellenos']],
  ['Spanish', ['Paella', 'Gazpacho', 'Tortilla Española', 'Churros', 'Empanada Gallega']],
  ['Italian', ['Neapolitan Pizza', 'Tiramisu', 'Gelato', 'Risotto alla Milanese', 'Lasagna', 'Spaghetti Carbonara', 'Margherita Pizza', 'Osso Buco', 'Panna Cotta', 'Cannoli', 'Arancini', 'Focaccia', 'Bruschetta']],
  ['French', ['Croissant', 'Croque Monsieur', 'Ratatouille', 'Coq au Vin', 'Beef Bourguignon', 'Quiche Lorraine', 'Crepes Suzette', 'Macarons', 'Escargot', 'Bouillabaisse']],
  ['Chinese', ['Dim Sum', 'Jiaozi Dumplings', 'Peking Duck', 'Mapo Tofu', 'Kung Pao Chicken', 'Char Siu', 'Congee']],
  ['Korean', ['Kimchi Jjigae', 'Bibimbap', 'Tteokbokki', 'Bulgogi']],
  ['Polish', ['Pierogi']],
  ['Canadian', ['Poutine']],
  ['Middle Eastern', ['Falafel', 'Hummus', 'Shawarma', 'Baklava']],
  ['Peruvian', ['Ceviche']],
  ['German', ['Currywurst']],
  ['British', ['Fish and Chips']],
  ['Indian', ['Chicken Biryani', 'Butter Chicken', 'Samosa', 'Tandoori Chicken', 'Garlic Naan', 'Chana Masala', 'Palak Paneer', 'Rogan Josh', 'Vindaloo', 'Roti']],
  ['Nigerian', ['Jollof Rice']],
  ['Ethiopian', ['Injera']],
  ['Greek', ['Moussaka']],
  ['Hungarian', ['Goulash']],
  ['Russian', ['Borscht', 'Pelmeni']],
  ['Indonesian', ['Nasi Goreng', 'Beef Rendang', 'Chicken Satay']],
  ['Malaysian', ['Laksa']],
  ['Salvadoran', ['Pupusas']],
  ['Venezuelan', ['Arepas']],
  ['Brazilian', ['Feijoada', 'Pão de Queijo', 'Churrasco']],
  ['Argentinian', ['Chimichurri Steak', 'Empanada']],
  ['Jamaican', ['Jerk Chicken']],
  ['Hawaiian', ['Poke Bowl', 'Loco Moco']],
])

const FOOD_EMOJI = buildMap([
  ['🍣', ['Sushi']],
  ['🍜', ['Ramen', 'Pho', 'Udon Noodles', 'Soba Noodles', 'Laksa']],
  ['🍝', ['Pad Thai', 'Pad See Ew', 'Spaghetti Carbonara', 'Lasagna']],
  ['🌮', ['Tacos al Pastor']],
  ['🥘', ['Paella']],
  ['🍕', ['Neapolitan Pizza', 'Margherita Pizza']],
  ['🥐', ['Croissant']],
  ['🥟', ['Dim Sum', 'Pierogi', 'Empanada', 'Jiaozi Dumplings', 'Pelmeni', 'Gyoza', 'Samosa', 'Empanada Gallega']],
  ['🍲', ['Kimchi Jjigae', 'Goulash', 'Borscht', 'Miso Soup', 'Shabu Shabu', 'Beef Bourguignon', 'Bouillabaisse', 'Feijoada', 'Mapo Tofu']],
  ['🍛', ['Chicken Biryani', 'Butter Chicken', 'Katsu Curry', 'Beef Rendang', 'Chana Masala', 'Palak Paneer', 'Rogan Josh', 'Vindaloo', 'Mole Poblano']],
  ['🍟', ['Poutine']],
  ['🧆', ['Falafel']],
  ['🥙', ['Hummus']],
  ['🍤', ['Ceviche', 'Tempura']],
  ['🍰', ['Tiramisu', 'Cannoli']],
  ['🍨', ['Gelato']],
  ['🍯', ['Baklava']],
  ['🌯', ['Shawarma', 'Enchiladas Verdes', 'Spring Rolls']],
  ['🌭', ['Currywurst']],
  ['🐟', ['Fish and Chips']],
  ['🍚', ['Bibimbap', 'Jollof Rice', 'Congee', 'Nasi Goreng', 'Risotto alla Milanese', 'Arancini']],
  ['🍢', ['Tteokbokki', 'Chicken Satay', 'Yakitori']],
  ['🥩', ['Bulgogi', 'Char Siu', 'Churrasco', 'Chimichurri Steak']],
  ['🫓', ['Injera', 'Garlic Naan', 'Pupusas', 'Arepas']],
  ['🍆', ['Moussaka', 'Ratatouille']],
  ['🦆', ['Peking Duck']],
  ['🍗', ['Kung Pao Chicken', 'Tandoori Chicken', 'Coq au Vin', 'Jerk Chicken']],
  ['🥖', ['Banh Mi', 'Focaccia']],
  ['🥪', ['Croque Monsieur']],
  ['🥧', ['Quiche Lorraine']],
  ['🥞', ['Crepes Suzette']],
  ['🍬', ['Macarons']],
  ['🐌', ['Escargot']],
  ['🍅', ['Bruschetta', 'Gazpacho']],
  ['🍳', ['Tortilla Española', 'Okonomiyaki']],
  ['🍩', ['Churros']],
  ['🥑', ['Guacamole']],
  ['🧀', ['Quesadilla', 'Pão de Queijo']],
  ['🫔', ['Tamales']],
  ['🌶️', ['Chiles Rellenos']],
  ['🍖', ['Osso Buco']],
  ['🍮', ['Panna Cotta']],
  ['🐙', ['Takoyaki']],
  ['🍙', ['Onigiri']],
  ['🥥', ['Poke Bowl']],
  ['🍳🍚', ['Loco Moco']],
])

// ---------- LEVEL 2: DRINKS ----------
const drinkNames = [
  'Matcha Latte', 'Espresso', 'Cappuccino', 'Americano', 'Cortado', 'Flat White', 'Mocha', 'Affogato',
  'Turkish Coffee', 'Vietnamese Egg Coffee', 'Bubble Tea', 'Thai Iced Tea', 'Masala Chai',
  'English Breakfast Tea', 'Earl Grey', 'Jasmine Tea', 'Oolong Tea', 'Yerba Mate', 'Horchata',
  'Agua Fresca', 'Limeade', 'Lemonade', 'Mojito', 'Margarita', 'Piña Colada', 'Daiquiri', 'Mai Tai',
  'Cosmopolitan', 'Negroni', 'Old Fashioned', 'Manhattan', 'Classic Martini', 'Mint Julep',
  'Whiskey Sour', 'Sangria', 'Mulled Wine', 'Champagne', 'Prosecco', 'Kir Royale', 'Bellini',
  'Aperol Spritz', 'Gin and Tonic', 'Moscow Mule', 'Pisco Sour', 'Caipirinha', 'Rum Punch',
  'Hot Toddy', 'Irish Coffee', 'Eggnog', 'Hot Chocolate', 'Chai Latte', 'Golden Turmeric Milk',
  'Kombucha', 'Ginger Beer', 'Root Beer', 'Cream Soda', 'Ramune', 'Calpico', 'Mango Lassi',
  'Sweet Lassi', 'Falooda', 'Sherbet', 'Vietnamese Iced Coffee', 'Café de Olla', 'Atole',
  'Champurrado', 'Tepache', 'Chicha Morada', 'Guaraná Soda', 'Mate Cocido', 'Coconut Water',
  'Sugarcane Juice', 'Rooibos Tea', 'Ceylon Tea', 'Gunpowder Tea', 'Genmaicha', 'Hojicha',
  'Roasted Barley Tea', 'Sikhye', 'Amazake', 'Soju Cocktail', 'Sake', 'Plum Wine',
  'Elderflower Cordial', 'Shrub Drinking Vinegar', 'Switchel', 'Birch Beer', 'Sarsaparilla',
  'Chocolate Milkshake', 'Malted Milkshake', 'Egg Cream', 'Italian Soda', 'Root Beer Float',
  'Vanilla Frappe', 'Iced Matcha', 'Cold Brew Coffee', 'Nitro Coffee', 'Vietnamese Coconut Coffee',
  'Turkish Salep', 'Ayran', 'Doogh', 'Tamarind Juice', 'Hibiscus Agua de Jamaica',
]
const glassTypes = ['tumbler', 'highball glass', 'coupe glass', 'martini glass', 'mug', 'teacup', 'wine glass', 'shot glass', 'mason jar', 'copper mug', 'rocks glass', 'flute']

const DRINK_ORIGIN = buildMap([
  ['Japan', ['Matcha Latte', 'Ramune', 'Calpico', 'Genmaicha', 'Hojicha', 'Amazake', 'Sake', 'Iced Matcha', 'Plum Wine', 'Roasted Barley Tea']],
  ['Italy', ['Espresso', 'Cappuccino', 'Americano', 'Mocha', 'Affogato', 'Prosecco', 'Bellini', 'Negroni', 'Aperol Spritz', 'Italian Soda']],
  ['Spain', ['Cortado', 'Sangria']],
  ['Australia', ['Flat White']],
  ['Turkey', ['Turkish Coffee', 'Turkish Salep', 'Ayran']],
  ['Vietnam', ['Vietnamese Egg Coffee', 'Vietnamese Iced Coffee', 'Vietnamese Coconut Coffee']],
  ['Taiwan', ['Bubble Tea']],
  ['Thailand', ['Thai Iced Tea']],
  ['India', ['Masala Chai', 'Mango Lassi', 'Sweet Lassi', 'Falooda', 'Chai Latte', 'Golden Turmeric Milk', 'Sugarcane Juice']],
  ['England', ['English Breakfast Tea', 'Earl Grey', 'Gin and Tonic']],
  ['China', ['Jasmine Tea', 'Oolong Tea', 'Gunpowder Tea', 'Kombucha']],
  ['Argentina', ['Yerba Mate', 'Mate Cocido']],
  ['Mexico', ['Horchata', 'Agua Fresca', 'Limeade', 'Café de Olla', 'Atole', 'Champurrado', 'Tepache', 'Tamarind Juice', 'Hibiscus Agua de Jamaica', 'Margarita']],
  ['United States', ['Lemonade', 'Root Beer', 'Cream Soda', 'Root Beer Float', 'Chocolate Milkshake', 'Malted Milkshake', 'Egg Cream', 'Birch Beer', 'Sarsaparilla', 'Vanilla Frappe', 'Cold Brew Coffee', 'Nitro Coffee', 'Cosmopolitan', 'Old Fashioned', 'Manhattan', 'Mint Julep', 'Whiskey Sour', 'Classic Martini', 'Mai Tai', 'Moscow Mule', 'Shrub Drinking Vinegar', 'Switchel', 'Eggnog']],
  ['Cuba', ['Mojito', 'Daiquiri']],
  ['Puerto Rico', ['Piña Colada']],
  ['Caribbean', ['Rum Punch']],
  ['France', ['Champagne', 'Kir Royale', 'Elderflower Cordial']],
  ['Germany', ['Mulled Wine']],
  ['Scotland', ['Hot Toddy']],
  ['Ireland', ['Irish Coffee']],
  ['Peru', ['Pisco Sour', 'Chicha Morada']],
  ['Brazil', ['Caipirinha', 'Guaraná Soda']],
  ['South Korea', ['Sikhye', 'Soju Cocktail']],
  ['Sri Lanka', ['Ceylon Tea']],
  ['South Africa', ['Rooibos Tea']],
  ['Iran', ['Sherbet', 'Doogh']],
  ['Philippines', ['Coconut Water']],
  ['United States', ['Hot Chocolate']],
  ['Jamaica', ['Ginger Beer']],
])

const DRINK_TEMP = buildMap([
  ['hot', ['Espresso', 'Cappuccino', 'Americano', 'Cortado', 'Flat White', 'Mocha', 'Turkish Coffee', 'Masala Chai', 'English Breakfast Tea', 'Earl Grey', 'Jasmine Tea', 'Oolong Tea', 'Yerba Mate', 'Mulled Wine', 'Hot Toddy', 'Irish Coffee', 'Hot Chocolate', 'Chai Latte', 'Golden Turmeric Milk', 'Café de Olla', 'Atole', 'Champurrado', 'Mate Cocido', 'Rooibos Tea', 'Ceylon Tea', 'Gunpowder Tea', 'Genmaicha', 'Hojicha', 'Roasted Barley Tea', 'Sikhye', 'Amazake', 'Turkish Salep', 'Vietnamese Egg Coffee']],
  ['cold', ['Bubble Tea', 'Thai Iced Tea', 'Horchata', 'Agua Fresca', 'Limeade', 'Lemonade', 'Mojito', 'Margarita', 'Piña Colada', 'Daiquiri', 'Mai Tai', 'Cosmopolitan', 'Negroni', 'Old Fashioned', 'Manhattan', 'Classic Martini', 'Mint Julep', 'Whiskey Sour', 'Sangria', 'Aperol Spritz', 'Gin and Tonic', 'Moscow Mule', 'Pisco Sour', 'Caipirinha', 'Rum Punch', 'Kombucha', 'Ginger Beer', 'Root Beer', 'Cream Soda', 'Ramune', 'Calpico', 'Mango Lassi', 'Sweet Lassi', 'Falooda', 'Sherbet', 'Vietnamese Iced Coffee', 'Tepache', 'Chicha Morada', 'Guaraná Soda', 'Coconut Water', 'Sugarcane Juice', 'Chocolate Milkshake', 'Malted Milkshake', 'Egg Cream', 'Italian Soda', 'Root Beer Float', 'Vanilla Frappe', 'Iced Matcha', 'Cold Brew Coffee', 'Nitro Coffee', 'Vietnamese Coconut Coffee', 'Ayran', 'Doogh', 'Tamarind Juice', 'Hibiscus Agua de Jamaica', 'Sarsaparilla', 'Birch Beer', 'Switchel', 'Shrub Drinking Vinegar', 'Affogato']],
  ['room temperature', ['Champagne', 'Prosecco', 'Kir Royale', 'Bellini', 'Plum Wine', 'Sake', 'Soju Cocktail', 'Eggnog', 'Elderflower Cordial', 'Matcha Latte']],
])

const DRINK_EMOJI = buildMap([
  ['🍵', ['Matcha Latte', 'English Breakfast Tea', 'Earl Grey', 'Jasmine Tea', 'Oolong Tea', 'Rooibos Tea', 'Ceylon Tea', 'Gunpowder Tea', 'Genmaicha', 'Hojicha', 'Roasted Barley Tea', 'Masala Chai', 'Chai Latte', 'Iced Matcha']],
  ['☕', ['Espresso', 'Cappuccino', 'Americano', 'Cortado', 'Flat White', 'Mocha', 'Affogato', 'Turkish Coffee', 'Vietnamese Egg Coffee', 'Vietnamese Iced Coffee', 'Cold Brew Coffee', 'Nitro Coffee', 'Vietnamese Coconut Coffee', 'Café de Olla', 'Irish Coffee']],
  ['🍹', ['Piña Colada', 'Mai Tai', 'Daiquiri', 'Rum Punch', 'Agua Fresca']],
  ['🍸', ['Cosmopolitan', 'Classic Martini', 'Negroni']],
  ['🧋', ['Bubble Tea']],
  ['🍷', ['Sangria', 'Mulled Wine', 'Plum Wine']],
  ['🥂', ['Champagne', 'Prosecco', 'Kir Royale', 'Bellini', 'Aperol Spritz']],
  ['🥤', ['Root Beer', 'Cream Soda', 'Ramune', 'Calpico', 'Root Beer Float', 'Italian Soda', 'Vanilla Frappe', 'Lemonade', 'Limeade', 'Sarsaparilla', 'Birch Beer', 'Guaraná Soda']],
  ['🍶', ['Sake', 'Soju Cocktail', 'Amazake', 'Sikhye']],
  ['🍺', ['Ginger Beer', 'Kombucha', 'Tepache']],
  ['🧃', ['Chicha Morada', 'Tamarind Juice', 'Hibiscus Agua de Jamaica', 'Sugarcane Juice', 'Guaraná Soda', 'Coconut Water']],
  ['🍫', ['Hot Chocolate', 'Chocolate Milkshake', 'Malted Milkshake']],
  ['🥛', ['Golden Turmeric Milk', 'Mango Lassi', 'Sweet Lassi', 'Ayran', 'Doogh', 'Eggnog', 'Egg Cream', 'Falooda', 'Sherbet']],
  ['🥃', ['Old Fashioned', 'Manhattan', 'Whiskey Sour', 'Mint Julep', 'Moscow Mule', 'Pisco Sour', 'Hot Toddy']],
  ['🍈', ['Horchata']],
  ['🥭', ['Caipirinha']],
  ['🌺', ['Elderflower Cordial', 'Switchel', 'Shrub Drinking Vinegar']],
  ['🍹🌿', ['Mojito', 'Margarita']],
  ['🌡️', ['Turkish Salep']],
  ['🍮', ['Atole', 'Champurrado']],
  ['🧊🍵', ['Thai Iced Tea']],
  ['🧉', ['Yerba Mate', 'Mate Cocido']],
  ['🍸🍋', ['Gin and Tonic']],
])

// ---------- LEVEL 3: CLOTHES ----------
const clothesNames = [
  'Kimono', 'Sari', 'Kilt', 'Lederhosen', 'Dirndl', 'Hanbok', 'Qipao', 'Poncho', 'Sarong', 'Kaftan',
  'Abaya', 'Dashiki', 'Kente Cloth Wrap', 'Guayabera Shirt', 'Barong Tagalog', 'Áo Dài', 'Cowboy Hat Outfit',
  'Denim Jacket', 'Leather Jacket', 'Trench Coat', 'Peacoat', 'Duffle Coat', 'Parka', 'Bomber Jacket',
  'Varsity Jacket', 'Tailored Blazer', 'Tuxedo', 'Three-Piece Suit', 'Zoot Suit', 'Flapper Dress',
  'Little Black Dress', 'A-Line Dress', 'Ball Gown', 'Wedding Dress', 'Wrap Dress', 'Sundress',
  'Maxi Dress', 'Pencil Skirt', 'Pleated Skirt', 'Culottes', 'Palazzo Pants', 'Bell Bottoms',
  'Skinny Jeans', 'Cargo Pants', 'Chinos', 'Denim Overalls', 'Jumpsuit', 'Romper', 'Turtleneck Sweater',
  'Cardigan', 'Cable Knit Sweater', 'Knit Poncho', 'Hoodie', 'Sweatshirt', 'Tank Top', 'Crop Top',
  'Halter Top', 'Off-Shoulder Top', 'Flannel Shirt', 'Oxford Shirt', 'Hawaiian Shirt', 'Polo Shirt',
  'Graphic Tee', 'Bikini', 'One-Piece Swimsuit', 'Wetsuit', 'Ski Suit', 'Snow Jacket', 'Rain Coat',
  'Windbreaker', 'Track Suit', 'Yoga Pants', 'Leggings', 'Bloomers', 'Corset', 'Bustier', 'Petticoat',
  'Crinoline Skirt', 'Toga', 'Chiton', 'Himation', 'Sarafan', 'Kosovorotka Shirt', 'Yukata',
  'Happi Coat', 'Batik Shirt', 'Ikat Dress', 'Huipil', 'Rebozo Shawl', 'Gaucho Pants', 'Bolero Jacket',
  'Traje de Luces', 'Flamenco Dress', 'Tartan Scarf', 'Fair Isle Sweater', 'Aran Sweater',
  'Wool Beret Outfit', 'Breton Stripe Shirt', 'Sailor Suit', 'Pinafore Dress', 'Nehru Jacket',
  'Salwar Kameez', 'Kurta', 'Lungi',
]
const materials = ['cotton', 'silk', 'wool', 'linen', 'denim', 'leather', 'velvet', 'satin', 'cashmere', 'polyester blend', 'hemp', 'brocade']
const seasons = ['spring', 'summer', 'autumn', 'winter', 'all-season']

const CLOTHES_ERA = buildMap([
  ['Traditional Japanese', ['Kimono', 'Yukata', 'Happi Coat']],
  ['Traditional Indian', ['Sari', 'Salwar Kameez', 'Kurta', 'Lungi', 'Nehru Jacket']],
  ['Traditional Scottish', ['Kilt', 'Tartan Scarf', 'Fair Isle Sweater']],
  ['Traditional Irish', ['Aran Sweater', 'Cable Knit Sweater']],
  ['Traditional German', ['Lederhosen', 'Dirndl']],
  ['Traditional Korean', ['Hanbok']],
  ['Traditional Chinese', ['Qipao']],
  ['Traditional Andean', ['Poncho', 'Knit Poncho']],
  ['Traditional Argentinian', ['Gaucho Pants']],
  ['Traditional Malay', ['Sarong']],
  ['Traditional Middle Eastern', ['Kaftan', 'Abaya']],
  ['Traditional West African', ['Dashiki', 'Kente Cloth Wrap']],
  ['Traditional Cuban', ['Guayabera Shirt']],
  ['Traditional Filipino', ['Barong Tagalog']],
  ['Traditional Vietnamese', ['Áo Dài']],
  ['American Western', ['Cowboy Hat Outfit']],
  ['20th century American', ['Denim Jacket', 'Sweatshirt']],
  ['20th century', ['Leather Jacket']],
  ['Early 20th century British', ['Trench Coat']],
  ['19th century Naval', ['Peacoat', 'Sailor Suit']],
  ['WWII-era British', ['Duffle Coat']],
  ['Traditional Inuit', ['Parka']],
  ['WWII-era American', ['Bomber Jacket']],
  ['1930s American', ['Varsity Jacket', 'Hoodie']],
  ['Contemporary', ['Tailored Blazer', 'Sundress', 'Romper', 'Cardigan', 'Tank Top', 'Off-Shoulder Top', 'One-Piece Swimsuit', 'Wetsuit', 'Ski Suit', 'Snow Jacket', 'Rain Coat', 'Windbreaker', 'Yoga Pants', 'Leggings', 'Bustier', 'Wedding Dress', 'Chinos', 'Graphic Tee', 'Pleated Skirt']],
  ['19th century British', ['Tuxedo']],
  ['Victorian British', ['Three-Piece Suit', 'Pinafore Dress']],
  ['1940s American', ['Zoot Suit']],
  ['1920s American', ['Flapper Dress']],
  ['1920s French', ['Little Black Dress', 'Polo Shirt']],
  ['1950s American', ['A-Line Dress', 'Pencil Skirt']],
  ['Victorian European', ['Ball Gown', 'Corset', 'Petticoat', 'Crinoline Skirt']],
  ['1970s American', ['Wrap Dress', 'Bell Bottoms', 'Maxi Dress', 'Halter Top']],
  ['1960s', ['Culottes', 'Palazzo Pants', 'Turtleneck Sweater', 'Track Suit']],
  ['2000s', ['Skinny Jeans']],
  ['1990s American', ['Cargo Pants', 'Crop Top']],
  ['American workwear', ['Denim Overalls', 'Flannel Shirt']],
  ['1970s', ['Jumpsuit']],
  ['Traditional British', ['Oxford Shirt']],
  ['Traditional Hawaiian', ['Hawaiian Shirt']],
  ['1940s French', ['Bikini']],
  ['Victorian American', ['Bloomers']],
  ['Ancient Roman', ['Toga']],
  ['Ancient Greek', ['Chiton', 'Himation']],
  ['Traditional Russian', ['Sarafan', 'Kosovorotka Shirt']],
  ['Traditional Indonesian', ['Batik Shirt', 'Ikat Dress']],
  ['Traditional Mayan', ['Huipil']],
  ['Traditional Mexican', ['Rebozo Shawl']],
  ['Traditional Spanish', ['Traje de Luces', 'Flamenco Dress', 'Bolero Jacket']],
  ['Traditional French', ['Wool Beret Outfit', 'Breton Stripe Shirt']],
])

const CLOTHES_MATERIAL = buildMap([
  ['denim', ['Denim Jacket', 'Denim Overalls', 'Skinny Jeans', 'Cargo Pants']],
  ['leather', ['Leather Jacket']],
  ['wool', ['Fair Isle Sweater', 'Aran Sweater', 'Cable Knit Sweater', 'Turtleneck Sweater', 'Wool Beret Outfit', 'Tartan Scarf', 'Kilt']],
  ['silk', ['Kimono', 'Qipao', 'Sari', 'Cheongsam', 'Flamenco Dress']],
  ['cotton', ['Guayabera Shirt', 'Oxford Shirt', 'Flannel Shirt', 'Graphic Tee', 'Hoodie', 'Sweatshirt', 'Tank Top']],
  ['neoprene', ['Wetsuit']],
  ['polyester blend', ['Track Suit', 'Windbreaker', 'Yoga Pants', 'Leggings', 'Ski Suit']],
])

const CLOTHES_EMOJI = buildMap([
  ['👘', ['Kimono', 'Yukata', 'Happi Coat']],
  ['🥻', ['Sari', 'Salwar Kameez']],
  ['👗', ['Flapper Dress', 'Little Black Dress', 'A-Line Dress', 'Ball Gown', 'Wedding Dress', 'Wrap Dress', 'Sundress', 'Maxi Dress', 'Flamenco Dress', 'Ikat Dress', 'Pinafore Dress']],
  ['🧥', ['Denim Jacket', 'Leather Jacket', 'Trench Coat', 'Peacoat', 'Duffle Coat', 'Parka', 'Bomber Jacket', 'Varsity Jacket', 'Tailored Blazer', 'Bolero Jacket', 'Nehru Jacket', 'Happi Coat', 'Snow Jacket', 'Rain Coat', 'Windbreaker']],
  ['👖', ['Skinny Jeans', 'Cargo Pants', 'Chinos', 'Bell Bottoms', 'Palazzo Pants', 'Culottes', 'Gaucho Pants', 'Yoga Pants', 'Leggings', 'Lungi']],
  ['👚', ['Halter Top', 'Off-Shoulder Top', 'Crop Top', 'Tank Top', 'Batik Shirt']],
  ['🎽', ['Track Suit', 'Sailor Suit']],
  ['👕', ['Graphic Tee', 'Polo Shirt', 'Breton Stripe Shirt', 'Hawaiian Shirt', 'Flannel Shirt', 'Oxford Shirt', 'Kosovorotka Shirt', 'Guayabera Shirt', 'Barong Tagalog', 'Kurta']],
  ['🧣', ['Tartan Scarf', 'Rebozo Shawl']],
  ['👔', ['Tuxedo', 'Three-Piece Suit', 'Zoot Suit', 'Traje de Luces']],
  ['🩱', ['Bikini', 'One-Piece Swimsuit', 'Wetsuit']],
  ['🧶', ['Turtleneck Sweater', 'Cardigan', 'Cable Knit Sweater', 'Knit Poncho', 'Fair Isle Sweater', 'Aran Sweater', 'Hoodie', 'Sweatshirt']],
  ['🎩', ['Cowboy Hat Outfit', 'Wool Beret Outfit']],
  ['🏛️', ['Toga', 'Chiton', 'Himation']],
  ['💃', ['Bustier', 'Corset', 'Petticoat', 'Crinoline Skirt']],
  ['🧥', ['Kilt', 'Lederhosen', 'Dirndl', 'Kaftan', 'Abaya', 'Dashiki', 'Kente Cloth Wrap']],
  ['🥻', ['Hanbok', 'Qipao', 'Áo Dài', 'Poncho', 'Sarong', 'Sarafan', 'Huipil']],
  ['👗', ['Pencil Skirt', 'Pleated Skirt', 'Jumpsuit', 'Romper']],
  ['👖', ['Denim Overalls']],
  ['⛷️', ['Ski Suit']],
  ['🩲', ['Bloomers']],
])

// ---------- LEVEL 4: JEWELRY ----------
const jewelryNames = [
  'Diamond Solitaire Ring', 'Pearl Necklace', 'Gold Bangle', 'Silver Anklet', 'Sapphire Earrings',
  'Ruby Pendant', 'Emerald Brooch', 'Amethyst Ring', 'Turquoise Bracelet', 'Jade Pendant', 'Opal Ring',
  'Garnet Necklace', 'Topaz Earrings', 'Aquamarine Ring', 'Citrine Bracelet', 'Onyx Cufflinks',
  'Moonstone Ring', 'Tanzanite Pendant', 'Peridot Earrings', 'Lapis Lazuli Necklace', 'Coral Bracelet',
  'Amber Pendant', 'Mother of Pearl Brooch', 'Rose Gold Ring', 'Platinum Band', 'Bridal Tiara',
  'Diadem', 'Celtic Torc', 'Signet Ring', 'Locket Necklace', 'Cameo Brooch', 'Charm Bracelet',
  'Friendship Bracelet', 'Anklet Chain', 'Toe Ring', 'Nath Nose Ring', 'Septum Ring', 'Ear Cuff',
  'Huggie Earrings', 'Chandelier Earrings', 'Hoop Earrings', 'Stud Earrings', 'Drop Earrings',
  'Choker Necklace', 'Y-Necklace', 'Bib Necklace', 'Lariat Necklace', 'Statement Necklace',
  'Bolo Tie', 'Cufflink Set', 'Tie Clip', 'Pocket Watch Chain', 'Rosary', 'Mala Beads',
  'Worry Beads', 'Claddagh Ring', 'Celtic Knot Pendant', 'Maasai Beaded Necklace',
  'Squash Blossom Necklace', 'Filigree Earrings', 'Kundan Necklace', 'Polki Ring',
  'Meenakari Bangle', 'Jhumka Earrings', 'Mangalsutra', 'Bindi Jewel', 'Ankh Pendant',
  'Scarab Beetle Ring', 'Egyptian Collar Necklace', 'Viking Arm Ring', 'Bracteate Pendant',
  'Byzantine Cross Pendant', 'Filigree Cross', 'Rune Pendant', 'Viking Amber Beads',
  'Cloisonné Brooch', 'Jade Bi Disc', 'Peineta Hair Comb', 'Mantilla Comb', 'Flamenco Earrings',
  'Milagro Charm', 'Worry Doll Bracelet', 'Huichol Beaded Earrings', 'Concha Belt', 'Wampum Beads',
  'Shell Necklace', 'Puka Shell Necklace', 'Hei Tiki Pendant', 'Greenstone Pendant',
  'Boomerang Pendant', 'Opal Cufflinks', 'Charm Bangle', 'Eternity Ring', 'Promise Ring',
  'Birthstone Ring', 'Cocktail Ring', 'Bangle Set', 'Gold Chain Necklace', 'Herringbone Chain',
  'Rope Chain Necklace', 'Snake Chain Bracelet',
]
const jewelryMaterials = ['14k gold', 'sterling silver', 'rose gold', 'platinum', 'brass', 'bronze', 'white gold', 'copper', 'titanium']

// Most jewelry names literally name their gemstone/metal ("Diamond Solitaire
// Ring", "Gold Bangle") — derive from the name itself instead of picking a
// random, possibly-contradictory one.
const GEMSTONE_KEYWORDS = ['diamond', 'sapphire', 'ruby', 'emerald', 'amethyst', 'turquoise', 'jade', 'opal', 'garnet', 'topaz', 'aquamarine', 'citrine', 'onyx', 'moonstone', 'tanzanite', 'peridot', 'lapis lazuli', 'coral', 'amber', 'pearl']
function deriveGemstone(name) {
  const lower = name.toLowerCase()
  for (const g of GEMSTONE_KEYWORDS) if (lower.includes(g)) return g
  return null
}
function deriveMaterial(name) {
  const lower = name.toLowerCase()
  if (lower.includes('rose gold')) return 'rose gold'
  if (lower.includes('gold')) return '14k gold'
  if (lower.includes('silver')) return 'sterling silver'
  if (lower.includes('platinum')) return 'platinum'
  if (lower.includes('bronze')) return 'bronze'
  if (lower.includes('brass')) return 'brass'
  if (lower.includes('amber')) return 'amber and silver'
  return null
}

const JEWELRY_CULTURE = buildMap([
  ['Celtic', ['Celtic Torc', 'Claddagh Ring', 'Celtic Knot Pendant']],
  ['Maasai', ['Maasai Beaded Necklace']],
  ['Navajo', ['Squash Blossom Necklace']],
  ['Indian', ['Kundan Necklace', 'Polki Ring', 'Meenakari Bangle', 'Jhumka Earrings', 'Mangalsutra', 'Bindi Jewel', 'Nath Nose Ring', 'Mala Beads']],
  ['Egyptian', ['Ankh Pendant', 'Scarab Beetle Ring', 'Egyptian Collar Necklace']],
  ['Viking', ['Viking Arm Ring', 'Bracteate Pendant', 'Viking Amber Beads', 'Rune Pendant']],
  ['Byzantine', ['Byzantine Cross Pendant', 'Filigree Cross', 'Cloisonné Brooch']],
  ['Chinese', ['Jade Bi Disc']],
  ['Spanish Flamenco', ['Peineta Hair Comb', 'Mantilla Comb', 'Flamenco Earrings']],
  ['Mexican Huichol', ['Milagro Charm', 'Worry Doll Bracelet', 'Huichol Beaded Earrings', 'Concha Belt']],
  ['Native American', ['Wampum Beads']],
  ['Polynesian', ['Puka Shell Necklace', 'Shell Necklace']],
  ['Māori', ['Hei Tiki Pendant', 'Greenstone Pendant']],
  ['Aboriginal Australian', ['Boomerang Pendant']],
  ['Greek', ['Worry Beads']],
  ['American Western', ['Bolo Tie']],
  ['Renaissance European', ['Bridal Tiara', 'Diadem', 'Signet Ring', 'Rosary']],
  ['Victorian English', ['Cameo Brooch', 'Locket Necklace']],
  ['Art Deco', ['Cocktail Ring', 'Eternity Ring']],
])

const JEWELRY_EMOJI = buildMap([
  ['💍', ['Diamond Solitaire Ring', 'Amethyst Ring', 'Opal Ring', 'Moonstone Ring', 'Rose Gold Ring', 'Signet Ring', 'Polki Ring', 'Claddagh Ring', 'Scarab Beetle Ring', 'Eternity Ring', 'Promise Ring', 'Birthstone Ring', 'Cocktail Ring']],
  ['📿', ['Rosary', 'Mala Beads', 'Worry Beads']],
  ['💎', ['Aquamarine Ring', 'Citrine Bracelet', 'Peridot Earrings']],
  ['👑', ['Bridal Tiara', 'Diadem']],
  ['🧿', ['Milagro Charm']],
  ['⌚', ['Pocket Watch Chain']],
  ['🔗', ['Gold Chain Necklace', 'Herringbone Chain', 'Rope Chain Necklace', 'Snake Chain Bracelet', 'Charm Bracelet', 'Friendship Bracelet', 'Anklet Chain']],
  ['✨', ['Filigree Earrings', 'Filigree Cross', 'Rune Pendant']],
])

// ---------- LEVEL 5: PLANTS ----------
const plantNames = [
  'Monstera Deliciosa', 'Fiddle Leaf Fig', 'Snake Plant', 'Golden Pothos', 'Peace Lily', 'ZZ Plant',
  'Aloe Vera', 'Echeveria Succulent', 'Saguaro Cactus', 'Bird of Paradise', 'Rubber Plant',
  'Philodendron', 'Spider Plant', 'Boston Fern', 'Calathea', 'Bromeliad', 'Phalaenopsis Orchid',
  'Bonsai Tree', 'Bamboo', 'Jade Plant', 'String of Pearls', 'Tillandsia Air Plant', 'Venus Flytrap',
  'Pitcher Plant', 'Lavender', 'Rosemary', 'Basil', 'Mint', 'Sage', 'Thyme', 'Chamomile',
  'Lemongrass', 'Sunflower', 'Tulip', 'Rose Bush', 'Peony', 'Hydrangea', 'Daffodil',
  'Lily of the Valley', 'Marigold', 'Zinnia', 'Lotus', 'Water Lily', 'Maidenhair Fern',
  'English Ivy', 'Begonia', 'Impatiens', 'Geranium', 'Petunia', 'Chrysanthemum', 'Camellia',
  'Azalea', 'Rhododendron', 'Hibiscus', 'Bougainvillea', 'Plumeria', 'Jasmine', 'Gardenia',
  'Magnolia', 'Cherry Blossom Tree', 'Japanese Maple', 'Ginkgo Tree', 'Areca Palm', 'Banana Plant',
  'Fig Tree', 'Olive Tree', 'Lemon Tree', 'Bamboo Palm', 'Dracaena', 'Croton', 'Anthurium',
  'Weeping Fig', 'Yucca', 'Agave', 'Elephant Ear Plant', 'Caladium', 'Coleus', 'Prayer Plant',
  'Nerve Plant', 'Polka Dot Plant', 'Wandering Jew Plant', 'Chinese Money Plant', 'String of Hearts',
  "Burro's Tail", 'Christmas Cactus', 'Bunny Ear Cactus', 'Barrel Cactus', 'Haworthia',
  'Sedum', 'Sempervivum', 'Kalanchoe', 'African Violet', 'Cyclamen', 'Poinsettia', 'Amaryllis',
  'Hyacinth', 'Crocus', 'Bearded Iris', 'Foxglove', 'Snapdragon', 'Cornflower', 'Poppy', 'Dahlia',
]
// Real care profiles, since giving a cactus "keep soil consistently moist"
// or a fern "drought tolerant" would be actively wrong advice, not just
// cosmetically off.
const PLANT_CARE_PROFILES = {
  aridSucculent: { light: 'full sun', water: 'water sparingly, drought tolerant', soil: 'sandy cactus mix', growthSpeed: 'slow' },
  jungleCactus: { light: 'bright indirect light', water: 'water when top soil is dry', soil: 'well-draining potting mix', growthSpeed: 'moderate' },
  tropicalHouseplant: { light: 'bright indirect light', water: 'water when top soil is dry', soil: 'well-draining potting mix', growthSpeed: 'moderate' },
  lowLight: { light: 'low light tolerant', water: 'water when top soil is dry', soil: 'well-draining potting mix', growthSpeed: 'slow' },
  shadeHumidity: { light: 'partial shade', water: 'keep soil consistently moist', soil: 'peat-based soil', growthSpeed: 'moderate' },
  carnivorousBog: { light: 'bright direct light', water: 'keep soil consistently moist', soil: 'peat-based soil', growthSpeed: 'slow' },
  epiphyte: { light: 'bright indirect light', water: 'mist regularly, loves humidity', soil: 'orchid bark mix', growthSpeed: 'slow' },
  aquatic: { light: 'full sun', water: 'keep soil consistently moist', soil: 'rich loamy soil', growthSpeed: 'fast' },
  herb: { light: 'full sun', water: 'water when top soil is dry', soil: 'well-draining potting mix', growthSpeed: 'fast' },
  flowering: { light: 'full sun', water: 'water weekly', soil: 'rich loamy soil', growthSpeed: 'moderate' },
  shadeFlower: { light: 'bright indirect light', water: 'water when top soil is dry', soil: 'peat-based soil', growthSpeed: 'moderate' },
  tree: { light: 'full sun', water: 'water weekly', soil: 'rich loamy soil', growthSpeed: 'slow' },
}

const PLANT_PROFILE = buildMap([
  ['aridSucculent', ['Aloe Vera', 'Echeveria Succulent', 'Saguaro Cactus', 'Jade Plant', 'String of Pearls', "Burro's Tail", 'Bunny Ear Cactus', 'Barrel Cactus', 'Haworthia', 'Sedum', 'Sempervivum', 'Kalanchoe', 'Agave', 'Yucca', 'String of Hearts']],
  ['jungleCactus', ['Christmas Cactus']],
  ['tropicalHouseplant', ['Monstera Deliciosa', 'Fiddle Leaf Fig', 'Golden Pothos', 'Rubber Plant', 'Philodendron', 'Bird of Paradise', 'Bonsai Tree', 'Dracaena', 'Croton', 'Anthurium', 'Weeping Fig', 'Elephant Ear Plant', 'Caladium', 'Wandering Jew Plant', 'Chinese Money Plant', 'Areca Palm', 'Banana Plant', 'Bamboo Palm', 'Coleus', 'Bamboo']],
  ['lowLight', ['Snake Plant', 'ZZ Plant', 'Spider Plant']],
  ['shadeHumidity', ['Boston Fern', 'Maidenhair Fern', 'Calathea', 'Prayer Plant', 'Nerve Plant', 'Polka Dot Plant', 'English Ivy', 'Begonia', 'Peace Lily']],
  ['carnivorousBog', ['Venus Flytrap', 'Pitcher Plant']],
  ['epiphyte', ['Tillandsia Air Plant', 'Phalaenopsis Orchid', 'Bromeliad']],
  ['aquatic', ['Lotus', 'Water Lily']],
  ['herb', ['Lavender', 'Rosemary', 'Basil', 'Mint', 'Sage', 'Thyme', 'Chamomile', 'Lemongrass']],
  ['flowering', ['Sunflower', 'Tulip', 'Rose Bush', 'Peony', 'Hydrangea', 'Daffodil', 'Lily of the Valley', 'Marigold', 'Zinnia', 'Chrysanthemum', 'Camellia', 'Azalea', 'Rhododendron', 'Hibiscus', 'Bougainvillea', 'Plumeria', 'Jasmine', 'Gardenia', 'Hyacinth', 'Crocus', 'Bearded Iris', 'Foxglove', 'Snapdragon', 'Cornflower', 'Poppy', 'Dahlia', 'Impatiens', 'Geranium', 'Petunia', 'Amaryllis', 'Cyclamen', 'Poinsettia']],
  ['shadeFlower', ['African Violet']],
  ['tree', ['Magnolia', 'Cherry Blossom Tree', 'Japanese Maple', 'Ginkgo Tree', 'Fig Tree', 'Olive Tree', 'Lemon Tree']],
])

// Explicit "toxic to pets" list (commonly cited by ASPCA/veterinary sources)
// — everything else defaults to pet-safe rather than guessing randomly.
const PLANT_PET_UNSAFE = new Set([
  'Monstera Deliciosa', 'Fiddle Leaf Fig', 'Snake Plant', 'Golden Pothos', 'Peace Lily', 'ZZ Plant',
  'Aloe Vera', 'Philodendron', 'Lily of the Valley', 'Azalea', 'Rhododendron', 'Tulip', 'Daffodil',
  'Hyacinth', 'Crocus', 'Foxglove', 'Poinsettia', 'Cyclamen', 'Amaryllis', 'Begonia', 'Bird of Paradise',
  'Jade Plant', 'Dracaena', 'Yucca', 'Elephant Ear Plant', 'Caladium', 'String of Pearls', 'Bougainvillea',
  'Plumeria', 'Cherry Blossom Tree', 'Fig Tree', 'Lemon Tree', 'Croton', 'Anthurium', 'Weeping Fig',
  'Agave', 'Coleus', 'Kalanchoe', 'Bearded Iris', 'Wandering Jew Plant', 'String of Hearts', 'English Ivy',
  'Geranium', 'Chrysanthemum', 'Peony', 'Hydrangea', 'Dahlia', 'Poppy',
])

const PLANT_EMOJI = buildMap([
  ['🌵', ['Saguaro Cactus', 'Bunny Ear Cactus', 'Barrel Cactus', 'Christmas Cactus']],
  ['🪴', ['Monstera Deliciosa', 'Fiddle Leaf Fig', 'Rubber Plant', 'Philodendron', 'Snake Plant', 'ZZ Plant', 'Golden Pothos', 'Dracaena', 'Croton', 'Weeping Fig', 'Bird of Paradise', 'Anthurium', 'Elephant Ear Plant', 'Caladium', 'Yucca', 'Agave']],
  ['🌿', ['Spider Plant', 'Boston Fern', 'Maidenhair Fern', 'Basil', 'Mint', 'Rosemary', 'Sage', 'Thyme', 'Lemongrass', 'English Ivy', 'Areca Palm', 'Bamboo Palm', 'Chinese Money Plant', 'Calathea', 'Prayer Plant', 'Nerve Plant', 'Polka Dot Plant', 'Wandering Jew Plant', 'Coleus', 'Lavender', 'Chamomile']],
  ['🎍', ['Bonsai Tree', 'Bamboo']],
  ['🌸', ['Peony', 'Hydrangea', 'Camellia', 'Azalea', 'Rhododendron', 'Hibiscus', 'Cherry Blossom Tree', 'Magnolia', 'Plumeria', 'Bougainvillea']],
  ['🌷', ['Tulip', 'Hyacinth', 'Crocus', 'Daffodil', 'Amaryllis', 'Lily of the Valley']],
  ['🌻', ['Sunflower', 'Marigold', 'Zinnia', 'Chrysanthemum', 'Dahlia', 'Snapdragon', 'Cornflower', 'Poppy', 'Impatiens', 'Geranium', 'Petunia', 'Gardenia', 'Jasmine', 'Cyclamen', 'Poinsettia', 'Foxglove', 'Bearded Iris']],
  ['🌹', ['Rose Bush']],
  ['🪷', ['Lotus', 'Water Lily']],
  ['🍀', ['Jade Plant', 'Sedum', 'Sempervivum', 'Aloe Vera', 'Echeveria Succulent', 'Haworthia', "Burro's Tail", 'String of Hearts', 'Kalanchoe', 'African Violet']],
  ['🪰', ['Venus Flytrap', 'Pitcher Plant']],
  ['🪶', ['Tillandsia Air Plant', 'Phalaenopsis Orchid', 'Bromeliad']],
  ['🌳', ['Japanese Maple', 'Ginkgo Tree', 'Fig Tree', 'Olive Tree', 'Lemon Tree', 'Banana Plant']],
  ['🤍', ['Peace Lily']],
  ['📿', ['String of Pearls']],
  ['🌺', ['Begonia']],
])

// ---------- LEVEL 6: FURNITURE ----------
const furnitureNames = [
  'Chesterfield Sofa', 'Eames Lounge Chair', 'Wingback Chair', 'Recliner', 'Chaise Lounge',
  'Bean Bag Chair', 'Rocking Chair', 'Windsor Chair', 'Adirondack Chair', 'Papasan Chair',
  'Barcelona Chair', 'Egg Chair', 'Ball Chair', 'Butterfly Chair', 'Ladder-Back Chair',
  'Wishbone Chair', 'Panton Chair', 'Tulip Table', 'Coffee Table', 'Console Table', 'Side Table',
  'Nesting Tables', 'Drop-Leaf Table', 'Trestle Table', 'Farmhouse Table', 'Pedestal Table',
  'Writing Desk', 'Roll-Top Desk', 'Standing Desk', 'Secretary Desk', 'Vanity Table', 'Bookshelf',
  'Ladder Shelf', 'Étagère', 'Credenza', 'Sideboard', 'Armoire', 'Wardrobe', 'Chest of Drawers',
  'Highboy Dresser', 'Lowboy Dresser', 'Nightstand', 'Storage Ottoman', 'Floor Pouf', 'Storage Bench',
  'Daybed', 'Futon', 'Murphy Bed', 'Bunk Bed', 'Canopy Bed', 'Sleigh Bed', 'Platform Bed',
  'Four-Poster Bed', 'Hammock', 'Hammock Chair', 'Porch Swing', 'Glider Rocker', 'Sectional Sofa',
  'Loveseat', 'Settee', 'Divan', 'Folding Screen Divider', 'Bar Cart', 'Bar Stool', 'Counter Stool',
  'Kitchen Island', 'Buffet Table', 'China Cabinet', 'Curio Cabinet', 'TV Stand', 'Media Console',
  'Bean Bag Lounger', 'Hanging Chair', 'Rattan Chair', 'Wicker Chair', 'Rocking Horse', 'Cradle',
  'Bassinet', 'Crib', 'Changing Table', 'Toy Chest', 'Umbrella Stand', 'Coat Rack', 'Hall Tree',
  'Shoe Rack', 'Mudroom Bench', 'Cheval Mirror Stand', 'Steamer Trunk', 'Blanket Chest',
  'Modular Shelving Unit', 'Cube Storage Unit', 'Corner Shelf', 'Floating Shelf', 'Display Cabinet',
  'Library Ladder', 'Piano Bench', 'Ottoman Footstool', 'Accent Chair', 'Task Chair',
  'Drafting Stool', 'Garden Bench',
]
const designStyles = ['Mid-century modern', 'Scandinavian', 'Industrial', 'Bohemian', 'Art Deco', 'Victorian', 'Rustic farmhouse', 'Minimalist', 'Traditional', 'Contemporary', 'Coastal', 'Japandi']
const furnitureMaterials = ['solid oak', 'walnut veneer', 'rattan and wicker', 'powder-coated steel', 'reclaimed pine', 'velvet upholstery', 'leather upholstery', 'bent plywood', 'marble top', 'teak']
const furnitureEras = ['Ancient', 'Medieval', '18th century', 'Victorian', '1920s', '1950s', '1960s', '1970s', '1980s', '1990s', 'Contemporary', 'Timeless traditional']

const FURNITURE_STYLE = buildMap([
  ['Victorian', ['Chesterfield Sofa', 'Wingback Chair', 'Highboy Dresser', 'Lowboy Dresser', 'China Cabinet', 'Cheval Mirror Stand', 'Curio Cabinet']],
  ['Mid-century modern', ['Eames Lounge Chair', 'Barcelona Chair', 'Egg Chair', 'Ball Chair', 'Wishbone Chair', 'Panton Chair', 'Tulip Table', 'Butterfly Chair', 'Sideboard', 'Credenza']],
  ['Rustic farmhouse', ['Windsor Chair', 'Adirondack Chair', 'Farmhouse Table', 'Trestle Table', 'Porch Swing', 'Garden Bench', 'Mudroom Bench', 'Hall Tree', 'Coat Rack', 'Shoe Rack']],
  ['Bohemian', ['Papasan Chair', 'Hammock', 'Hammock Chair', 'Hanging Chair', 'Rattan Chair', 'Wicker Chair', 'Floor Pouf', 'Bean Bag Chair', 'Bean Bag Lounger']],
  ['Industrial', ['Ladder-Back Chair', 'Bar Cart', 'Bar Stool', 'Counter Stool', 'Standing Desk', 'Task Chair', 'Drafting Stool', 'Modular Shelving Unit', 'Cube Storage Unit']],
  ['Traditional', ['Writing Desk', 'Roll-Top Desk', 'Secretary Desk', 'Vanity Table', 'Armoire', 'Wardrobe', 'Chest of Drawers', 'Buffet Table', 'Étagère', 'Library Ladder', 'Piano Bench', 'Divan']],
  ['Contemporary', ['Recliner', 'Chaise Lounge', 'Coffee Table', 'Console Table', 'Side Table', 'Nesting Tables', 'Drop-Leaf Table', 'Pedestal Table', 'Bookshelf', 'Ladder Shelf', 'Nightstand', 'Storage Ottoman', 'Storage Bench', 'Daybed', 'Futon', 'Murphy Bed', 'Platform Bed', 'Sectional Sofa', 'Loveseat', 'Settee', 'Folding Screen Divider', 'Kitchen Island', 'TV Stand', 'Media Console', 'Toy Chest', 'Umbrella Stand', 'Corner Shelf', 'Floating Shelf', 'Display Cabinet', 'Ottoman Footstool', 'Accent Chair', 'Changing Table', 'Rocking Chair', 'Glider Rocker']],
  ['Traditional wooden', ['Bunk Bed', 'Canopy Bed', 'Sleigh Bed', 'Four-Poster Bed', 'Rocking Horse', 'Cradle', 'Bassinet', 'Crib', 'Steamer Trunk', 'Blanket Chest']],
])

const FURNITURE_EMOJI = buildMap([
  ['🛋️', ['Chesterfield Sofa', 'Sectional Sofa', 'Loveseat', 'Settee', 'Divan', 'Daybed', 'Chaise Lounge']],
  ['🪑', ['Eames Lounge Chair', 'Wingback Chair', 'Recliner', 'Bean Bag Chair', 'Rocking Chair', 'Windsor Chair', 'Adirondack Chair', 'Papasan Chair', 'Barcelona Chair', 'Egg Chair', 'Ball Chair', 'Butterfly Chair', 'Ladder-Back Chair', 'Wishbone Chair', 'Panton Chair', 'Bar Stool', 'Counter Stool', 'Bean Bag Lounger', 'Hanging Chair', 'Rattan Chair', 'Wicker Chair', 'Ottoman Footstool', 'Accent Chair', 'Task Chair', 'Drafting Stool', 'Glider Rocker']],
  ['🛏️', ['Daybed', 'Futon', 'Murphy Bed', 'Bunk Bed', 'Canopy Bed', 'Sleigh Bed', 'Platform Bed', 'Four-Poster Bed', 'Cradle', 'Bassinet', 'Crib']],
  ['🗄️', ['Bookshelf', 'Ladder Shelf', 'Étagère', 'Credenza', 'Sideboard', 'Armoire', 'Wardrobe', 'Chest of Drawers', 'Highboy Dresser', 'Lowboy Dresser', 'China Cabinet', 'Curio Cabinet', 'Modular Shelving Unit', 'Cube Storage Unit', 'Corner Shelf', 'Floating Shelf', 'Display Cabinet', 'Blanket Chest', 'Steamer Trunk', 'Toy Chest']],
  ['🪞', ['Vanity Table', 'Cheval Mirror Stand']],
  ['🚪', ['Folding Screen Divider', 'Hall Tree', 'Coat Rack']],
  ['🧺', ['Storage Ottoman', 'Floor Pouf', 'Storage Bench', 'Umbrella Stand', 'Shoe Rack', 'Mudroom Bench']],
  ['🪵', ['Tulip Table', 'Coffee Table', 'Console Table', 'Side Table', 'Nesting Tables', 'Drop-Leaf Table', 'Trestle Table', 'Farmhouse Table', 'Pedestal Table', 'Buffet Table', 'Kitchen Island', 'Nightstand']],
  ['🖊️', ['Writing Desk', 'Roll-Top Desk', 'Standing Desk', 'Secretary Desk']],
  ['🏕️', ['Hammock', 'Hammock Chair', 'Porch Swing']],
  ['🍸', ['Bar Cart']],
  ['📺', ['TV Stand', 'Media Console']],
  ['🐴', ['Rocking Horse']],
  ['👶', ['Changing Table']],
  ['📚', ['Library Ladder']],
  ['🎹', ['Piano Bench']],
])

// ---------- LEVEL 7: ANIME CHARACTERS ----------
const animeChars = [
  ['Naruto Uzumaki', 'Naruto', 'Loud, determined, loyal, never gives up', 'Shadow Clone Jutsu, Rasengan'],
  ['Sasuke Uchiha', 'Naruto', 'Stoic, driven by vengeance, prodigious', 'Sharingan, Chidori'],
  ['Sakura Haruno', 'Naruto', 'Fiercely loyal, disciplined medic-nin', 'Superhuman strength, medical ninjutsu'],
  ['Kakashi Hatake', 'Naruto', 'Calm, reserved, brilliant tactician', 'Sharingan, Chidori'],
  ['Itachi Uchiha', 'Naruto', 'Quiet, self-sacrificing, burdened by duty', 'Amaterasu, Tsukuyomi'],
  ['Monkey D. Luffy', 'One Piece', 'Carefree, fearless, endlessly optimistic', 'Gomu Gomu no Mi rubber powers'],
  ['Roronoa Zoro', 'One Piece', 'Stoic swordsman with an iron will', 'Three-sword style swordsmanship'],
  ['Nami', 'One Piece', 'Clever navigator with a love of treasure', 'Weather-manipulating Clima-Tact'],
  ['Sanji', 'One Piece', 'Chivalrous chef with a fiery kick', 'Diable Jambe fire kicks'],
  ['Tony Tony Chopper', 'One Piece', 'Shy, kind-hearted reindeer doctor', 'Human-Human Fruit transformations'],
  ['Nico Robin', 'One Piece', 'Composed archaeologist with a dark past', 'Flower-Flower Fruit powers'],
  ['Goku', 'Dragon Ball', 'Cheerful, battle-loving, pure-hearted', 'Kamehameha, Super Saiyan transformations'],
  ['Vegeta', 'Dragon Ball', 'Proud, competitive Saiyan prince', 'Galick Gun, Super Saiyan forms'],
  ['Bulma', 'Dragon Ball', 'Brilliant inventor and adventurer', 'Genius-level engineering'],
  ['Gohan', 'Dragon Ball', 'Gentle scholar with hidden power', 'Masenko, hidden Super Saiyan potential'],
  ['Piccolo', 'Dragon Ball', 'Reserved mentor, once a rival', 'Special Beam Cannon, regeneration'],
  ['Ichigo Kurosaki', 'Bleach', 'Hot-headed but deeply protective', 'Zangetsu, Bankai transformation'],
  ['Rukia Kuchiki', 'Bleach', 'Disciplined, compassionate soul reaper', 'Sode no Shirayuki ice zanpakuto'],
  ['Edward Elric', 'Fullmetal Alchemist', 'Short-tempered genius alchemist', 'Alchemy without a transmutation circle'],
  ['Alphonse Elric', 'Fullmetal Alchemist', 'Gentle soul bound to armor', 'Alchemy, super strength'],
  ['Roy Mustang', 'Fullmetal Alchemist', 'Ambitious, calculating flame alchemist', 'Flame alchemy via ignition gloves'],
  ['Light Yagami', 'Death Note', 'Charismatic, ruthless idealist', 'The Death Note'],
  ['L Lawliet', 'Death Note', 'Eccentric, brilliant detective', 'Unmatched deductive reasoning'],
  ['Eren Yeager', 'Attack on Titan', 'Driven by rage and freedom', 'Titan shifting'],
  ['Mikasa Ackerman', 'Attack on Titan', 'Fiercely protective and skilled', 'Superhuman combat ability'],
  ['Levi Ackerman', 'Attack on Titan', "Humanity's strongest soldier", 'Unmatched blade mastery'],
  ['Armin Arlert', 'Attack on Titan', 'Intelligent strategist, quiet courage', 'Colossal Titan shifting'],
  ['Tanjiro Kamado', 'Demon Slayer', 'Kind, empathetic, relentless', 'Water Breathing, Sun Breathing'],
  ['Nezuko Kamado', 'Demon Slayer', 'Protective demon sister', 'Blood demon art, size manipulation'],
  ['Zenitsu Agatsuma', 'Demon Slayer', 'Anxious but powerful when asleep', 'Thunder Breathing'],
  ['Inosuke Hashibira', 'Demon Slayer', 'Wild, boastful boar-masked fighter', 'Beast Breathing'],
  ['Izuku Midoriya', 'My Hero Academia', 'Analytical, self-sacrificing hero-in-training', 'One For All'],
  ['All Might', 'My Hero Academia', 'Symbol of peace, boundlessly heroic', 'One For All'],
  ['Bakugo Katsuki', 'My Hero Academia', 'Explosive temper, relentless drive', 'Explosion Quirk'],
  ['Ochaco Uraraka', 'My Hero Academia', 'Cheerful and determined', 'Zero Gravity Quirk'],
  ['Todoroki Shoto', 'My Hero Academia', 'Reserved, dual-natured fighter', 'Half-Cold Half-Hot Quirk'],
  ['Spike Spiegel', 'Cowboy Bebop', 'Laid-back bounty hunter with a past', 'Jeet Kune Do martial arts'],
  ['Faye Valentine', 'Cowboy Bebop', 'Sharp-tongued, independent gambler', 'Sharpshooting, quick wit'],
  ['Usagi Tsukino', 'Sailor Moon', 'Clumsy but big-hearted heroine', 'Moon Tiara Action'],
  ['Sailor Mercury', 'Sailor Moon', 'Studious and analytical', 'Shabon Spray water attacks'],
  ['Sailor Mars', 'Sailor Moon', 'Fiery, intuitive priestess', 'Fire Soul attacks'],
  ['Ash Ketchum', 'Pokémon', 'Eternally optimistic trainer', 'Pokémon battling and bonds'],
  ['Pikachu', 'Pokémon', 'Loyal, spirited electric partner', 'Thunderbolt'],
  ['Misty', 'Pokémon', 'Tomboyish water-type specialist', 'Water Pokémon mastery'],
  ['Yugi Muto', 'Yu-Gi-Oh!', 'Kind-hearted dueling prodigy', 'Millennium Puzzle, card strategy'],
  ['Astro Boy', 'Astro Boy', 'Heroic robot with a human heart', 'Rocket propulsion, super strength'],
  ['Doraemon', 'Doraemon', 'Warm-hearted robotic cat from the future', 'Fourth-dimensional pocket gadgets'],
  ['Nobita Nobi', 'Doraemon', 'Clumsy but big-dreaming schoolboy', 'Reliance on Doraemon\'s gadgets'],
  ['Shinji Ikari', 'Neon Genesis Evangelion', 'Withdrawn, conflicted pilot', 'Evangelion Unit-01 synchronization'],
  ['Rei Ayanami', 'Neon Genesis Evangelion', 'Quiet, enigmatic pilot', 'Evangelion Unit-00 synchronization'],
  ['Asuka Langley', 'Neon Genesis Evangelion', 'Confident, prideful pilot', 'Evangelion Unit-02 synchronization'],
  ['Lelouch Lamperouge', 'Code Geass', 'Brilliant, ruthless strategist', 'Geass power of absolute obedience'],
  ['C.C.', 'Code Geass', 'Mysterious, immortal and detached', 'Code immortality, Geass bestowal'],
  ['Killua Zoldyck', 'Hunter x Hunter', 'Former assassin, loyal friend', 'Lightning-based Nen abilities'],
  ['Gon Freecss', 'Hunter x Hunter', 'Pure-hearted, instinctive adventurer', 'Jajanken Nen technique'],
  ['Kurapika', 'Hunter x Hunter', 'Composed, driven by justice', 'Scarlet Eyes chain abilities'],
  ['Leorio Paradinight', 'Hunter x Hunter', 'Brash but big-hearted aspiring doctor', 'Nen-enhanced fisticuffs'],
  ['Natsu Dragneel', 'Fairy Tail', 'Hot-blooded, loyal fire mage', 'Fire Dragon Slayer magic'],
  ['Lucy Heartfilia', 'Fairy Tail', 'Determined celestial spirit mage', 'Celestial Spirit summoning'],
  ['Erza Scarlet', 'Fairy Tail', 'Disciplined, powerful knight mage', 'Requip: The Knight armor magic'],
  ['Gray Fullbuster', 'Fairy Tail', 'Cool-headed ice mage', 'Ice-Make magic'],
  ['Rimuru Tempest', 'That Time I Got Reincarnated as a Slime', 'Adaptable, benevolent slime ruler', 'Predator and shapeshifting skills'],
  ['Saitama', 'One Punch Man', 'Deadpan hero bored by his own power', 'One-punch knockout strength'],
  ['Genos', 'One Punch Man', 'Earnest cyborg disciple', 'Incinerate cannons'],
  ['Tatsumaki', 'One Punch Man', 'Prideful, immensely powerful esper', 'Telekinesis'],
  ['Mob (Shigeo Kageyama)', 'Mob Psycho 100', 'Reserved, morally grounded psychic', 'Overwhelming psychic power'],
  ['Reigen Arataka', 'Mob Psycho 100', 'Charismatic con-man mentor', 'Skilled talker, no real psychic power'],
  ['Violet Evergarden', 'Violet Evergarden', 'Reserved former soldier learning empathy', 'Ghostwriting, precise combat training'],
  ['Chihiro Ogino', 'Spirited Away', 'Timid girl who grows brave', 'Quick-witted problem solving'],
  ['Howl', "Howl's Moving Castle", 'Vain but caring wizard', 'Shape-shifting fire magic'],
  ['Kiki', "Kiki's Delivery Service", 'Independent young witch', 'Broom flight, delivery service'],
  ['Rin Tohsaka', 'Fate/stay night', 'Proud, sharp-witted mage', 'Gandr curse, jewel magecraft'],
  ['Saber', 'Fate/stay night', 'Noble, honor-bound knight', 'Excalibur'],
  ['Miku Nakano', 'The Quintessential Quintuplets', 'Shy, hardworking sister', 'Military history knowledge'],
  ['Kaguya Shinomiya', 'Kaguya-sama: Love is War', 'Prideful genius strategist', 'Psychological warfare tactics'],
  ['Miyuki Shirogane', 'Kaguya-sama: Love is War', 'Diligent, composed student council president', 'Master planning and self-control'],
  ['Anya Forger', 'Spy x Family', 'Mischievous telepathic child', 'Mind-reading'],
  ['Loid Forger', 'Spy x Family', 'Composed master spy and father', 'Master of disguise and combat'],
  ['Yor Forger', 'Spy x Family', 'Gentle assassin and mother', 'Superhuman assassination skills'],
  ['Denji', 'Chainsaw Man', 'Impulsive, simple-hearted devil hunter', 'Chainsaw transformation'],
  ['Power', 'Chainsaw Man', 'Boastful, chaotic blood fiend', 'Blood manipulation'],
  ['Makima', 'Chainsaw Man', 'Calm, controlling devil', 'Control Devil powers'],
  ['Rem', 'Re:Zero', 'Devoted, self-sacrificing maid', 'Water magic, superhuman strength'],
  ['Emilia', 'Re:Zero', 'Kind-hearted half-elf candidate', 'Ice and spirit magic'],
  ['Subaru Natsuki', 'Re:Zero', 'Anxious but resolute time-looper', 'Return by Death'],
  ['Zero Two', 'Darling in the Franxx', 'Fierce, affectionate hybrid pilot', 'Horned partial-klaxosaur strength'],
  ['Hiro', 'Darling in the Franxx', 'Gentle, determined pilot', 'FRANXX piloting synchronization'],
  ['Yato', 'Noragami', 'Scrappy, ambitious minor deity', 'Divine weapon manifestation'],
  ['Yukine', 'Noragami', 'Impulsive spirit blade regalia', 'Shinki transformation into a blade'],
  ['Sebastian Michaelis', 'Black Butler', 'Impeccable, cunning demon butler', 'Supernatural butler abilities'],
  ['Ciel Phantomhive', 'Black Butler', 'Composed, vengeful young earl', 'Strategic mind, Faustian contract'],
  ['Hinata Hyuga', 'Naruto', 'Gentle, quietly determined', 'Byakugan, Gentle Fist'],
  ['Gaara', 'Naruto', 'Once feared, now a compassionate leader', 'Sand manipulation'],
  ['Rock Lee', 'Naruto', 'Hardworking taijutsu specialist', 'Eight Gates taijutsu'],
  ['Neji Hyuga', 'Naruto', 'Disciplined prodigy of the Hyuga clan', 'Byakugan, Eight Trigrams'],
  ['Shikamaru Nara', 'Naruto', 'Lazy but brilliant strategist', 'Shadow Possession Jutsu'],
  ['Tenten', 'Naruto', 'Confident weapons specialist', 'Weapon summoning scrolls'],
  ['Choji Akimichi', 'Naruto', 'Loyal, food-loving fighter', 'Multi-Size Jutsu'],
  ['Kai Chisaki (Overhaul)', 'My Hero Academia', 'Cold, meticulous crime boss', 'Overhaul disassembly Quirk'],
  ['Momo Yaoyorozu', 'My Hero Academia', 'Studious, resourceful creator', 'Creation Quirk'],
]

// ---------- LEVEL 8: ANIMALS ----------
const animalData = [
  ['Red Panda', 'Temperate forests of the Himalayas', 'Bamboo, fruits, insects', '8-10 years', 'Endangered'],
  ['Giant Panda', 'Bamboo forests of central China', 'Almost exclusively bamboo', '20 years', 'Vulnerable'],
  ['Snow Leopard', 'High mountains of Central Asia', 'Wild sheep, goats, small mammals', '15-18 years', 'Vulnerable'],
  ['Bengal Tiger', 'Forests and grasslands of South Asia', 'Deer, wild boar', '10-15 years', 'Endangered'],
  ['African Lion', 'Savannas of sub-Saharan Africa', 'Large ungulates', '10-14 years', 'Vulnerable'],
  ['Cheetah', 'Grasslands of Africa', 'Gazelles, small antelope', '10-12 years', 'Vulnerable'],
  ['Jaguar', 'Rainforests of the Americas', 'Deer, capybara, fish', '12-15 years', 'Near Threatened'],
  ['Clouded Leopard', 'Southeast Asian forests', 'Birds, primates, small deer', '11 years', 'Vulnerable'],
  ['Arctic Fox', 'Arctic tundra', 'Lemmings, birds, carrion', '3-6 years', 'Least Concern'],
  ['Fennec Fox', 'Sahara desert', 'Insects, rodents, plants', '10-13 years', 'Least Concern'],
  ['Gray Wolf', 'Forests and tundra of the Northern Hemisphere', 'Deer, elk, moose', '6-8 years', 'Least Concern'],
  ['Coyote', 'North American plains and forests', 'Rodents, rabbits, fruit', '10-14 years', 'Least Concern'],
  ['Dingo', 'Australian outback', 'Rabbits, rodents, birds', '10 years', 'Vulnerable'],
  ['African Wild Dog', 'Sub-Saharan African savanna', 'Antelope, wildebeest calves', '10-12 years', 'Endangered'],
  ['Spotted Hyena', 'African savanna', 'Carrion, wildebeest, zebra', '12-16 years', 'Least Concern'],
  ['Meerkat', 'Kalahari desert', 'Insects, small reptiles', '12-14 years', 'Least Concern'],
  ['Sea Otter', 'North Pacific coastal waters', 'Sea urchins, crabs, mollusks', '15-20 years', 'Endangered'],
  ['River Otter', 'Rivers and wetlands of North America', 'Fish, crayfish, frogs', '8-13 years', 'Least Concern'],
  ['Beaver', 'Rivers and lakes of North America', 'Bark, aquatic plants', '10-15 years', 'Least Concern'],
  ['Platypus', 'Rivers of eastern Australia', 'Insect larvae, shrimp', '11-17 years', 'Near Threatened'],
  ['Echidna', 'Australian woodlands', 'Ants and termites', '14-16 years', 'Least Concern'],
  ['Wombat', 'Australian forests and grasslands', 'Grasses, roots, bark', '15 years', 'Least Concern'],
  ['Koala', 'Eucalyptus forests of Australia', 'Eucalyptus leaves', '10-15 years', 'Vulnerable'],
  ['Red Kangaroo', 'Australian outback', 'Grasses and shrubs', '20-25 years', 'Least Concern'],
  ['Wallaby', 'Australian bushland', 'Grasses and leaves', '9-15 years', 'Least Concern'],
  ['Tasmanian Devil', 'Tasmania woodlands', 'Carrion, small mammals', '5-6 years', 'Endangered'],
  ['Three-toed Sloth', 'Central and South American rainforests', 'Leaves', '20-30 years', 'Least Concern'],
  ['Giant Anteater', 'Grasslands of Central and South America', 'Ants and termites', '14-16 years', 'Vulnerable'],
  ['Nine-banded Armadillo', 'Americas grasslands and forests', 'Insects, grubs', '12-15 years', 'Least Concern'],
  ['Capybara', 'South American wetlands', 'Grasses, aquatic plants', '8-10 years', 'Least Concern'],
  ['Chinchilla', 'Andes mountains', 'Grasses, seeds, fruits', '10-15 years', 'Endangered'],
  ['Hedgehog', 'European gardens and woodlands', 'Insects, worms, slugs', '4-7 years', 'Least Concern'],
  ['North American Porcupine', 'Forests of North America', 'Bark, stems, leaves', '5-7 years', 'Least Concern'],
  ['Flying Squirrel', 'Forests of North America and Asia', 'Nuts, fruit, insects', '5-6 years', 'Least Concern'],
  ['Chipmunk', 'North American woodlands', 'Seeds, nuts, berries', '3 years', 'Least Concern'],
  ['Prairie Dog', 'North American grasslands', 'Grasses and roots', '3-5 years', 'Least Concern'],
  ['American Bison', 'North American plains', 'Grasses', '15-20 years', 'Near Threatened'],
  ['Moose', 'Northern forests of North America', 'Aquatic plants, twigs, bark', '15-25 years', 'Least Concern'],
  ['Elk', 'North American forests and mountains', 'Grasses, shrubs, bark', '10-13 years', 'Least Concern'],
  ['Reindeer', 'Arctic tundra', 'Lichen, grasses', '15 years', 'Vulnerable'],
  ['Alpine Ibex', 'European Alps', 'Grasses and herbs', '15-19 years', 'Least Concern'],
  ['Chamois', 'European mountains', 'Alpine grasses and herbs', '14-22 years', 'Least Concern'],
  ['Mountain Goat', 'Rocky Mountains', 'Grasses, mosses, shrubs', '9-12 years', 'Least Concern'],
  ['Bighorn Sheep', 'North American mountains', 'Grasses and shrubs', '10-15 years', 'Least Concern'],
  ['Alpaca', 'Andes highlands', 'Grasses', '15-20 years', 'Least Concern'],
  ['Llama', 'Andes highlands', 'Grasses and shrubs', '15-25 years', 'Least Concern'],
  ['Vicuña', 'Andean altiplano', 'Grasses', '15-20 years', 'Least Concern'],
  ['Dromedary Camel', 'Deserts of the Middle East and Africa', 'Thorny plants, dry grasses', '40-50 years', 'Least Concern'],
  ['Okapi', 'Congo rainforest', 'Leaves, buds, fruit', '20-30 years', 'Endangered'],
  ['Giraffe', 'African savanna', 'Acacia leaves', '20-25 years', 'Vulnerable'],
  ['Plains Zebra', 'African savanna', 'Grasses', '20-25 years', 'Near Threatened'],
  ['White Rhinoceros', 'African grasslands', 'Grasses', '40-50 years', 'Near Threatened'],
  ['Hippopotamus', 'African rivers and lakes', 'Grasses', '40-50 years', 'Vulnerable'],
  ['African Elephant', 'African savanna and forests', 'Grasses, bark, fruit', '60-70 years', 'Endangered'],
  ['Asian Elephant', 'South and Southeast Asian forests', 'Grasses, bark, fruit', '48-60 years', 'Endangered'],
  ['Orangutan', 'Rainforests of Borneo and Sumatra', 'Fruit, leaves, bark', '35-45 years', 'Critically Endangered'],
  ['Gorilla', 'Central African forests', 'Leaves, stems, fruit', '35-40 years', 'Critically Endangered'],
  ['Chimpanzee', 'Central and West African forests', 'Fruit, leaves, insects', '33-45 years', 'Endangered'],
  ['Bonobo', 'Congo Basin rainforest', 'Fruit, leaves, insects', '40 years', 'Endangered'],
  ['Ring-tailed Lemur', 'Madagascar forests', 'Fruit, leaves, flowers', '16-20 years', 'Endangered'],
  ['Aye-Aye', 'Madagascar rainforest', 'Insect larvae, seeds, fruit', '20 years', 'Endangered'],
  ['Tarsier', 'Southeast Asian rainforests', 'Insects, small vertebrates', '12-24 years', 'Vulnerable'],
  ['Sun Bear', 'Southeast Asian rainforests', 'Insects, fruit, honey', '25 years', 'Vulnerable'],
  ['Sloth Bear', 'Forests of the Indian subcontinent', 'Termites, ants, fruit', '20-25 years', 'Vulnerable'],
  ['Polar Bear', 'Arctic sea ice', 'Seals', '20-25 years', 'Vulnerable'],
  ['Grizzly Bear', 'North American forests and mountains', 'Salmon, berries, roots', '20-25 years', 'Least Concern'],
  ['Spectacled Bear', 'Andean cloud forests', 'Fruit, bromeliads, bark', '20-25 years', 'Vulnerable'],
  ['Narwhal', 'Arctic Ocean', 'Fish and squid', '30-40 years', 'Near Threatened'],
  ['Beluga Whale', 'Arctic and sub-Arctic waters', 'Fish and squid', '35-50 years', 'Least Concern'],
  ['Orca', 'Oceans worldwide', 'Fish, seals, other marine mammals', '50-80 years', 'Data Deficient'],
  ['Humpback Whale', 'Oceans worldwide', 'Krill and small fish', '45-50 years', 'Least Concern'],
  ['Blue Whale', 'Oceans worldwide', 'Krill', '80-90 years', 'Endangered'],
  ['Bottlenose Dolphin', 'Temperate and tropical oceans', 'Fish and squid', '40-50 years', 'Least Concern'],
  ['Manatee', 'Coastal waters and rivers of the Americas', 'Seagrasses and aquatic plants', '40-60 years', 'Vulnerable'],
  ['Dugong', 'Indo-Pacific coastal waters', 'Seagrasses', '70 years', 'Vulnerable'],
  ['Harbor Seal', 'Coastal waters of the Northern Hemisphere', 'Fish and squid', '25-30 years', 'Least Concern'],
  ['California Sea Lion', 'Pacific coast of North America', 'Fish and squid', '17-20 years', 'Least Concern'],
  ['Walrus', 'Arctic coastal waters', 'Clams and mollusks', '20-30 years', 'Vulnerable'],
  ['Emperor Penguin', 'Antarctic coastline', 'Fish, krill, squid', '15-20 years', 'Near Threatened'],
  ['Gentoo Penguin', 'Sub-Antarctic islands', 'Krill and small fish', '15-20 years', 'Least Concern'],
  ['Atlantic Puffin', 'North Atlantic coastal cliffs', 'Small fish', '20-25 years', 'Vulnerable'],
  ['Flamingo', 'Shallow lakes and lagoons worldwide', 'Algae and small crustaceans', '20-30 years', 'Least Concern'],
  ['Peacock', 'South Asian forests', 'Seeds, insects, small reptiles', '15-20 years', 'Least Concern'],
  ['Toco Toucan', 'South American rainforests', 'Fruit, insects, small vertebrates', '20 years', 'Least Concern'],
  ['Scarlet Macaw', 'Central and South American rainforests', 'Fruit, seeds, nuts', '40-50 years', 'Least Concern'],
  ['Sulphur-crested Cockatoo', 'Australian woodlands', 'Seeds, fruit, insects', '40-60 years', 'Least Concern'],
  ['Snowy Owl', 'Arctic tundra', 'Lemmings and small mammals', '10 years', 'Vulnerable'],
  ['Great Horned Owl', 'Forests of the Americas', 'Rodents, rabbits, birds', '13-15 years', 'Least Concern'],
  ['Bald Eagle', 'North American lakes and rivers', 'Fish', '20-30 years', 'Least Concern'],
  ['Peregrine Falcon', 'Cliffs and cities worldwide', 'Birds caught in flight', '15-20 years', 'Least Concern'],
  ['Ruby-throated Hummingbird', 'North and Central American gardens', 'Nectar and small insects', '3-5 years', 'Least Concern'],
  ['Common Kingfisher', 'Rivers and lakes of Eurasia', 'Small fish', '2-7 years', 'Least Concern'],
  ['Great Hornbill', 'South and Southeast Asian forests', 'Fruit, small animals', '35-40 years', 'Vulnerable'],
  ['Cassowary', 'New Guinea and Australian rainforests', 'Fallen fruit', '40-50 years', 'Least Concern'],
  ['Ostrich', 'African savanna', 'Plants, seeds, insects', '40-45 years', 'Least Concern'],
  ['Emu', 'Australian grasslands', 'Plants, seeds, insects', '10-20 years', 'Least Concern'],
  ['Kiwi Bird', 'New Zealand forests', 'Insects, worms, seeds', '25-50 years', 'Vulnerable'],
  ['Axolotl', 'Lakes of Xochimilco, Mexico', 'Small invertebrates', '10-15 years', 'Critically Endangered'],
  ['Panther Chameleon', 'Madagascar forests', 'Insects', '2-3 years', 'Least Concern'],
  ['Green Iguana', 'Central and South American rainforests', 'Leaves, flowers, fruit', '15-20 years', 'Least Concern'],
  ['Komodo Dragon', 'Indonesian islands', 'Deer, wild boar, carrion', '30 years', 'Endangered'],
]

const LEVELS = [
  { id: 1, name: 'Food', category: 'food', emoji: '🍜', color: '#FF6B6B', totalItems: 100, description: 'Savor dishes from every corner of the globe.' },
  { id: 2, name: 'Drinks', category: 'drinks', emoji: '🍹', color: '#4ECDC4', totalItems: 100, description: 'Sip your way through the world\'s beverages.' },
  { id: 3, name: 'Clothes', category: 'clothes', emoji: '👘', color: '#FFE66D', totalItems: 100, description: 'Discover fashion across cultures and eras.' },
  { id: 4, name: 'Jewelry', category: 'jewelry', emoji: '💍', color: '#A8E6CF', totalItems: 100, description: 'Collect dazzling adornments and heirlooms.' },
  { id: 5, name: 'Plants', category: 'plants', emoji: '🌿', color: '#88D8B0', totalItems: 100, description: 'Grow a garden of green companions.' },
  { id: 6, name: 'Furniture', category: 'furniture', emoji: '🛋️', color: '#DDA0DD', totalItems: 100, description: 'Furnish your dream space piece by piece.' },
  { id: 7, name: 'Anime Characters', category: 'anime', emoji: '🍥', color: '#FFB7B2', totalItems: 100, description: 'Recruit legendary characters to your roster.' },
  { id: 8, name: 'Animals', category: 'animals', emoji: '🐼', color: '#FF9F1C', totalItems: 100, description: 'Meet remarkable creatures from every habitat.' },
]

const categoryEmojiPools = {
  food: ['🍣', '🍜', '🍕', '🌮', '🍛', '🥟', '🍱', '🍲', '🥘', '🍤'],
  drinks: ['🍵', '☕', '🍹', '🍸', '🧋', '🍷', '🥤', '🍶', '🍺', '🧃'],
  clothes: ['👘', '👗', '👖', '🧥', '👚', '🎽', '👕', '🧣', '🥻', '👔'],
  jewelry: ['💍', '📿', '💎', '👑', '🧿', '⌚', '🔗', '✨'],
  plants: ['🌿', '🌵', '🌷', '🌸', '🪴', '🌱', '🍀', '🌻'],
  furniture: ['🛋️', '🪑', '🛏️', '🗄️', '🪞', '🚪', '🧺'],
  anime: ['🍥', '⚔️', '🌸', '⭐', '🔥', '💫', '🎌'],
  animals: ['🐼', '🦊', '🐨', '🦁', '🐘', '🐧', '🦋', '🐢'],
}

const CUISINE_INGREDIENTS = {
  Japanese: ['soy sauce', 'rice', 'nori', 'miso', 'sesame oil', 'scallion', 'dashi', 'wasabi'],
  Thai: ['fish sauce', 'lime', 'chili', 'lemongrass', 'coconut milk', 'basil', 'peanuts'],
  Vietnamese: ['fish sauce', 'rice noodles', 'lime', 'cilantro', 'mint', 'chili', 'lemongrass'],
  Mexican: ['corn tortilla', 'lime', 'cilantro', 'chili', 'onion', 'avocado', 'cumin'],
  Spanish: ['olive oil', 'garlic', 'paprika', 'saffron', 'tomato', 'seafood'],
  Italian: ['olive oil', 'basil', 'garlic', 'tomato', 'parmesan', 'pasta'],
  French: ['butter', 'cream', 'shallot', 'thyme', 'white wine', 'flour'],
  Chinese: ['soy sauce', 'ginger', 'garlic', 'scallion', 'sesame oil', 'rice wine'],
  Korean: ['gochujang', 'garlic', 'sesame oil', 'scallion', 'soy sauce', 'kimchi'],
  Polish: ['potato', 'onion', 'sour cream', 'flour', 'butter'],
  Canadian: ['potato', 'cheese curds', 'gravy'],
  'Middle Eastern': ['chickpeas', 'tahini', 'olive oil', 'cumin', 'garlic', 'lemon'],
  Peruvian: ['lime', 'chili', 'onion', 'cilantro', 'white fish'],
  German: ['pork', 'mustard', 'paprika', 'potato'],
  British: ['potato', 'malt vinegar', 'flour', 'white fish'],
  Indian: ['garam masala', 'ginger', 'garlic', 'turmeric', 'cumin', 'yogurt', 'chili'],
  Nigerian: ['tomato', 'chili pepper', 'onion', 'rice'],
  Ethiopian: ['teff flour', 'berbere spice', 'onion', 'chili'],
  Greek: ['eggplant', 'olive oil', 'tomato', 'oregano', 'feta'],
  Hungarian: ['paprika', 'onion', 'beef', 'sour cream'],
  Russian: ['beet', 'sour cream', 'potato', 'dill', 'cabbage'],
  Indonesian: ['coconut milk', 'chili', 'shallot', 'lemongrass', 'peanut'],
  Malaysian: ['coconut milk', 'chili', 'shrimp paste', 'lemongrass', 'rice noodles'],
  Salvadoran: ['corn masa', 'cheese', 'beans'],
  Venezuelan: ['corn masa', 'cheese', 'black beans'],
  Brazilian: ['black beans', 'pork', 'cassava', 'lime'],
  Argentinian: ['beef', 'parsley', 'garlic', 'olive oil'],
  Jamaican: ['scotch bonnet chili', 'allspice', 'thyme', 'garlic'],
  Hawaiian: ['soy sauce', 'sesame oil', 'rice', 'ahi tuna', 'scallion'],
}

function makeFoodMeta(name) {
  const cuisine = FOOD_CUISINE[name] ?? 'Italian'
  const pool = CUISINE_INGREDIENTS[cuisine] ?? CUISINE_INGREDIENTS.Italian
  const ingredients = pickMany(pool, Math.min(5, pool.length))
  return {
    kind: 'food',
    recipe: `${ingredients.slice(0, 4).join(', ')} — prepared in classic ${cuisine} style.`,
    cuisine,
    difficulty: pick(difficulties),
    ingredients,
  }
}
function makeDrinkMeta(name) {
  const origin = DRINK_ORIGIN[name] ?? 'United States'
  const servingTemp = DRINK_TEMP[name] ?? 'cold'
  return {
    kind: 'drinks',
    recipe: `A carefully balanced blend served in a ${pick(glassTypes)}.`,
    origin,
    servingTemp,
    glassType: pick(glassTypes),
  }
}
function makeClothesMeta(name) {
  return {
    kind: 'clothes',
    styleDescription: `A ${pick(['flowing', 'structured', 'lightweight', 'ornate', 'tailored', 'relaxed'])} garment prized for its craftsmanship.`,
    era: CLOTHES_ERA[name] ?? 'Contemporary',
    material: CLOTHES_MATERIAL[name] ?? pick(materials),
    season: pick(seasons),
  }
}
function makeJewelryMeta(name) {
  return {
    kind: 'jewelry',
    material: deriveMaterial(name) ?? pick(jewelryMaterials),
    gemstone: deriveGemstone(name) ?? 'none (metalwork only)',
    style: pick(['minimalist', 'ornate', 'vintage', 'bohemian', 'art deco', 'modern']),
    originCulture: JEWELRY_CULTURE[name] ?? 'Renaissance European',
  }
}
function makePlantMeta(name) {
  const profileKey = PLANT_PROFILE[name] ?? 'tropicalHouseplant'
  const profile = PLANT_CARE_PROFILES[profileKey]
  return {
    kind: 'plants',
    ...profile,
    petSafe: !PLANT_PET_UNSAFE.has(name),
  }
}
function makeFurnitureMeta(name) {
  const w = 30 + Math.floor(rng() * 150)
  const d = 30 + Math.floor(rng() * 100)
  const h = 40 + Math.floor(rng() * 150)
  return {
    kind: 'furniture',
    designStyle: FURNITURE_STYLE[name] ?? pick(designStyles),
    era: pick(furnitureEras),
    material: pick(furnitureMaterials),
    dimensions: `${w}cm W x ${d}cm D x ${h}cm H`,
  }
}
function makeAnimeMeta([, series, personality, ability]) {
  return {
    kind: 'anime',
    personality,
    series,
    ability,
    catchphrase: `"Believe in the path I've chosen." — a signature line from ${series}.`,
  }
}
function makeAnimalMeta([, habitat, diet, lifespan, conservationStatus]) {
  return { kind: 'animals', habitat, diet, lifespan, conservationStatus }
}

const article = (word) => (/^[aeiou]/i.test(word) ? 'an' : 'a')
const Article = (word) => (/^[aeiou]/i.test(word) ? 'An' : 'A')

// Turns an item's real metadata into an accurate one-line fact, instead of
// generic filler text disconnected from the actual item.
function factSnippet(m) {
  switch (m.kind) {
    case 'food':
      return `A classic ${m.cuisine} dish (${m.difficulty} to make).`
    case 'drinks':
      return `A ${m.servingTemp} drink with roots in ${m.origin}.`
    case 'clothes':
      return `${Article(m.era)} ${m.era} garment in ${m.material}, worn ${m.season === 'all-season' ? 'year-round' : `in ${m.season}`}.`
    case 'jewelry':
      return `${Article(m.style)} ${m.style} piece in ${m.material}${m.gemstone.startsWith('none') ? '' : ` featuring ${m.gemstone}`}, rooted in ${m.originCulture} tradition.`
    case 'plants':
      return `Thrives in ${m.light}; ${m.water}.`
    case 'furniture':
      return `${Article(m.designStyle)} ${m.designStyle.toLowerCase()} piece crafted from ${m.material}.`
    case 'anime':
      return `From ${m.series} — ${m.personality.toLowerCase()}.`
    case 'animals':
      return `Native to ${m.habitat.toLowerCase()}. Conservation status: ${m.conservationStatus}.`
    default:
      return ''
  }
}

function buildLevelItems(level, names, metaFn, emojiMap = {}) {
  return names.slice(0, 100).map((entry, i) => {
    const name = Array.isArray(entry) ? entry[0] : entry
    const rarity = weightedRarity()
    const id = `item-${String(level.id).padStart(2, '0')}${String(i + 1).padStart(3, '0')}`
    const metadata = metaFn(entry)
    return {
      id,
      name,
      category: level.category,
      level: level.id,
      description: `${name} — ${article(rarity)} ${rarity} find from the ${level.name.toLowerCase()} collection. ${factSnippet(metadata)}`,
      categoryEmoji: emojiMap[name] ?? pick(categoryEmojiPools[level.category]),
      rarity,
      metadata,
      illustrationPlaceholder: `${level.emoji}`,
      aiGenerated: false,
    }
  })
}

const first100 = (arr) => arr.slice(0, 100)
console.log('Checking name-lookup coverage (first 100 items per category)...')
checkCoverage(first100(foodNames), FOOD_CUISINE, 'FOOD_CUISINE')
checkCoverage(first100(foodNames), FOOD_EMOJI, 'FOOD_EMOJI')
checkCoverage(first100(drinkNames), DRINK_ORIGIN, 'DRINK_ORIGIN')
checkCoverage(first100(drinkNames), DRINK_TEMP, 'DRINK_TEMP')
checkCoverage(first100(drinkNames), DRINK_EMOJI, 'DRINK_EMOJI')
checkCoverage(first100(clothesNames), CLOTHES_ERA, 'CLOTHES_ERA')
checkCoverage(first100(clothesNames), CLOTHES_EMOJI, 'CLOTHES_EMOJI')
checkCoverage(first100(plantNames), PLANT_PROFILE, 'PLANT_PROFILE')
checkCoverage(first100(plantNames), PLANT_EMOJI, 'PLANT_EMOJI')
checkCoverage(first100(furnitureNames), FURNITURE_STYLE, 'FURNITURE_STYLE')
checkCoverage(first100(furnitureNames), FURNITURE_EMOJI, 'FURNITURE_EMOJI')

const items = [
  ...buildLevelItems(LEVELS[0], foodNames, makeFoodMeta, FOOD_EMOJI),
  ...buildLevelItems(LEVELS[1], drinkNames, makeDrinkMeta, DRINK_EMOJI),
  ...buildLevelItems(LEVELS[2], clothesNames, makeClothesMeta, CLOTHES_EMOJI),
  ...buildLevelItems(LEVELS[3], jewelryNames, makeJewelryMeta, JEWELRY_EMOJI),
  ...buildLevelItems(LEVELS[4], plantNames, makePlantMeta, PLANT_EMOJI),
  ...buildLevelItems(LEVELS[5], furnitureNames, makeFurnitureMeta, FURNITURE_EMOJI),
  ...buildLevelItems(LEVELS[6], animeChars, makeAnimeMeta),
  ...buildLevelItems(LEVELS[7], animalData, makeAnimalMeta),
]

console.log(`Generated ${items.length} items.`)
for (const level of LEVELS) {
  const count = items.filter((i) => i.level === level.id).length
  console.log(`  Level ${level.id} (${level.name}): ${count} items`)
}

writeFileSync(path.join(__dirname, '../data/items.json'), JSON.stringify(items, null, 2))
writeFileSync(path.join(__dirname, '../data/levels.json'), JSON.stringify(LEVELS, null, 2))
console.log('Wrote src/data/items.json and src/data/levels.json')
