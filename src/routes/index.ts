import { CustomRouteObject } from '@/types/common/routes';
import publicRoutes from './publicRoutes';
import privateRoutes from './privateRoutes';

const getRoutes = (): CustomRouteObject[] => {
    return [
        ...publicRoutes,
        ...privateRoutes
    ];
};

export default getRoutes;