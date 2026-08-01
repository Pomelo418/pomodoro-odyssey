import type { CollectionItem } from '@/types'

export function getMetadataFields(item: CollectionItem): { label: string; value: string }[] {
  const m = item.metadata
  switch (m.kind) {
    case 'food':
      return [
        { label: 'Cuisine', value: m.cuisine },
        { label: 'Difficulty', value: m.difficulty },
        { label: 'Recipe', value: m.recipe },
        { label: 'Ingredients', value: m.ingredients.join(', ') },
      ]
    case 'drinks':
      return [
        { label: 'Origin', value: m.origin },
        { label: 'Served', value: m.servingTemp },
        { label: 'Glass', value: m.glassType },
        { label: 'Recipe', value: m.recipe },
      ]
    case 'clothes':
      return [
        { label: 'Era', value: m.era },
        { label: 'Material', value: m.material },
        { label: 'Season', value: m.season },
        { label: 'Style', value: m.styleDescription },
      ]
    case 'jewelry':
      return [
        { label: 'Material', value: m.material },
        { label: 'Gemstone', value: m.gemstone },
        { label: 'Style', value: m.style },
        { label: 'Origin Culture', value: m.originCulture },
      ]
    case 'plants':
      return [
        { label: 'Light', value: m.light },
        { label: 'Water', value: m.water },
        { label: 'Soil', value: m.soil },
        { label: 'Growth Speed', value: m.growthSpeed },
        { label: 'Pet Safe', value: m.petSafe ? 'Yes' : 'No' },
      ]
    case 'furniture':
      return [
        { label: 'Design Style', value: m.designStyle },
        { label: 'Era', value: m.era },
        { label: 'Material', value: m.material },
        { label: 'Dimensions', value: m.dimensions },
      ]
    case 'anime':
      return [
        { label: 'Series', value: m.series },
        { label: 'Personality', value: m.personality },
        { label: 'Ability', value: m.ability },
        { label: 'Catchphrase', value: m.catchphrase },
      ]
    case 'animals':
      return [
        { label: 'Habitat', value: m.habitat },
        { label: 'Diet', value: m.diet },
        { label: 'Lifespan', value: m.lifespan },
        { label: 'Conservation Status', value: m.conservationStatus },
      ]
  }
}
