export interface Restaurant {
    id: string;
    url: string;
    name: string;
    address: string;
    categories: string;
    img_url: string;
    added?: boolean;
    votes?: string[]
}