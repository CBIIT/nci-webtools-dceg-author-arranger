import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {

  /** Stores detached route handles for each path */
  handlers: {[name: string]: DetachedRouteHandle} = {};

  /** Determines if this route (and its subtree) should be detached to be reused later */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  /** Stores the detached route. */
  store({routeConfig}: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    this.handlers[routeConfig.path] = handle;
  }

  /** Determines if this route (and its subtree) should be reattached */
  shouldAttach({routeConfig}: ActivatedRouteSnapshot): boolean {
    return !!routeConfig && !!this.handlers[routeConfig.path];
  }

  /** Retrieves the previously stored route */
  retrieve({routeConfig}: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!routeConfig) { return null; }
    return this.handlers[routeConfig.path];
  }

  /** Determines if a route should be reused */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
