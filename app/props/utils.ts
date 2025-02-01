import { IncludedItem } from './types';

export function resolveRelationship<T extends IncludedItem>(
    included: IncludedItem[],
    relationship: { data: { type: string; id: string } } | null | undefined
): T | null {
    if (!relationship?.data) return null;
    
    // Debug logging
    console.log('Looking for:', relationship.data.type, relationship.data.id);
    console.log('Available types:', [...new Set(included.map(item => item.type))]);
    
    const found = included.find(
        item => item.type === relationship.data.type && item.id === relationship.data.id
    ) as T;
    
    if (!found) {
        console.log('No item found with id:', relationship.data.id);
    }
    
    return found ?? null;
}
