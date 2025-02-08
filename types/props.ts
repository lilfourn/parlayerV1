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
    type: 'projection';
    id: string;
    attributes: {
        adjusted_odds: number | null;
        board_time: string;
        custom_image: string | null;
        description: string;
        end_time: string | null;
        flash_sale_line_score: number | null;
        game_id: string;
        hr_20: boolean;
        in_game: boolean;
        is_live: boolean;
        is_promo: boolean;
        line_score: number;
        line_movement?: {
            original: number;
            current: number;
            direction: 'up' | 'down';
            difference: number;
        };
        odds_type: string;
        projection_type: string;
        rank: number;
        refundable: boolean;
        start_time: string;
        stat_display_name: string;
        stat_type: string;
        status: 'pre_game' | 'in_progress' | 'final' | string;
        tv_channel: string | null;
        updated_at: string;
    };
    relationships: {
        duration: { data: { type: string; id: string; } };
        league: { data: { type: string; id: string; } };
        new_player: { data: { type: string; id: string; } | null };
        projection_type: { data: { type: string; id: string; } };
        score: { data: null };
        stat_average: { data: { type: string; id: string; } | null };
        stat_type: { data: { type: string; id: string; } };
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
