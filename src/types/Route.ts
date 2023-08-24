import { Router } from 'express';
import Mock from 'src/types/Mock';

export default interface IRoutes {
    'dungeons&dragons5e': {
        system: Router;
        realms: Router;
        gods: Router;
        backgrounds: Router;
        feats: Router;
        weapons: Router;
        armors: Router;
        items: Router;
        races: Router;
        classes: Router;
        magicItems: Router;
        spells: Router;
        wikis: Router;
        monsters: Router;
    };
}

export interface RouteDeclareParams {
    name: string;
    location: string;
    required: boolean;
    type: string;
}

export interface ParamName {
    name: string;
    type: string;
}

export type RouteWrapperDeclared = string | null | RouteDeclareParams[] | Mock | boolean | unknown;
