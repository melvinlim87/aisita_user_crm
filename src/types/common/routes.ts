import { type RouteObject } from 'react-router-dom';
import type { ReactNode, LazyExoticComponent, ComponentType } from 'react';

export type CustomRouteObject = RouteObject & {
    redirect?: string;
    element?: ReactNode;
    component?: LazyExoticComponent<ComponentType<any>>;
    protected?: boolean;
    layout?: boolean;
};