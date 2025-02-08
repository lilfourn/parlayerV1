export interface StatAverage {
    type: string;
    id: string;
    attributes: {
        average: number;
        count: number;
        max_value: number;
    };
}

export interface NewPlayer {
    type: string;
    id: string;
    attributes: {
        combo: boolean;
        display_name: string;
        image_url: string;
        league: string;
        league_id: number;
        market: string | null;
        name: string;
        position: string;
        team: string;
        team_name: string | null;
    };
    relationships: {
        league: {
            data: {
                type: string;
                id: string;
            };
        };
        team_data: {
            data: {
                type: string;
                id: string;
            };
        };
    };
}

export interface League {
    type: 'league';
    id: string;
    attributes: {
        name: string;
        sport: string;
        season: string;
    };
}

export interface TeamData {
    type: 'team';
    id: string;
    attributes: {
        name: string;
        city: string;
        abbreviation: string;
        logo_url: string;
    };
}

export interface Projection {
    type: any;
    id: string;
    attributes: {
        odds_type: string;
        custom_image: null;
        end_time: null;
        flash_sale_line_score: null;
        hr_20: any;
        in_game: any;
        is_live: any;
        is_promo: any;
        projection_type: any;
        rank: any;
        refundable: any;
        tv_channel: null;
        board_time: any;
        adjusted_odds: null;
        updated_at: any;
        description: string;
        status: string;
        line_score: number;
        start_time: string;
        stat_type: string;
        stat_display_name: string;
        game_id: string;
        line_movement?: {
            original: number;
            current: number;
            direction: 'up' | 'down';
            difference: number;
        };
    };
    relationships: {
        duration: {
            data: {
                id: string;
            };
        };
        new_player: {
            data: {
                type: string;
                id: string;
            };
        };
        stat_average: {
            data: {
                type: string;
                id: string;
            };
        };
        league: {
            data: {
                type: string;
                id: string;
            };
        };
    };
}

export type IncludedItem = NewPlayer | League | TeamData | StatAverage;

export interface ApiResponse {
    data: Projection[];
    included: IncludedItem[];
}

export interface ProjectionWithAttributes {
    projection: Projection;
    player: NewPlayer | null;
    stats: StatAverage | null;
}
