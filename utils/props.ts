import { IncludedItem } from '@/types/props';

export function resolveRelationship<T extends IncludedItem>(
    included: IncludedItem[],
    relationship: { data: { type: string; id: string } } | null | undefined
): T | null {
    if (!relationship?.data) return null;
    
    const found = included.find(
        item => item.type === relationship.data.type && item.id === relationship.data.id
    ) as T;
    
    if (!found) {
        console.log('No item found with id:', relationship.data.id);
    }
    
    return found ?? null;
}
