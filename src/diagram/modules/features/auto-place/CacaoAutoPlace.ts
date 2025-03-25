import EventBus from 'diagram-js/lib/core/EventBus';
import {
  Connection,
  ElementLike,
  Shape,
  ShapeLike,
} from 'diagram-js/lib/model/Types';
import { Rect, asTRBL, getOrientation } from 'diagram-js/lib/layout/LayoutUtil';
import AutoPlace from 'diagram-js/lib/features/auto-place/AutoPlace';
import Canvas, { Point } from 'diagram-js/lib/core/Canvas';
import CacaoModeling from '../modeling/CacaoModeling';
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import CacaoUtils from '../../core/CacaoUtils';
import PlaybookHandler from '../../model/PlaybookHandler';
import { SwitchConditionStep } from 'lib/cacao2-js';
import { CacaoConnectionType } from 'src/diagram/elements/connections/CacaoBaseConnection';
import { ConnectionExtension } from '../../model/coordinates-extension/ConnectionExtension';
import { CasesConnectionExtension } from '../../model/coordinates-extension/CasesConnectionExtension';
import { NextStepsConnectionExtension } from '../../model/coordinates-extension/NextStepsConnectionExtension';

// Define valid connection types
type ValidConnectionTypes = 'cases' | 'next-steps' | 'on-completion' | 'on-success' | 'on-failure' | 'on-true' | 'on-false';

/**
 * This class is a module for auto-placing shapes with optimized coordinate caching
 * - module's entry points:
 *    - event("autoPlace")
 * - goal:
 *    - it provides a position to place a shape depending on its source's connection
 */
export default class CacaoAutoPlace extends AutoPlace {
  _eventBus: EventBus;
  _modeling: CacaoModeling;

  private readonly HORIZONTAL_MARGIN_BETWEEN_SHAPES = 130;
  private readonly VERTICAL_MARGIN_BETWEEN_SHAPES = 200;
  private _elementRegistry: ElementRegistry;
  private _playbookHandler: PlaybookHandler;

  // Local instance caches
  private _waypointsCache: Map<string, Point[]>;
  private _boundsCache: Map<string, Rect>;
  private _positionCache: Map<string, Point>;

  constructor(
    eventBus: EventBus,
    modeling: CacaoModeling,
    canvas: Canvas,
    elementRegistry: ElementRegistry,
    playbookHandler: PlaybookHandler,
  ) {
    super(eventBus, modeling, canvas);
    this._eventBus = eventBus;
    this._modeling = modeling;
    this._elementRegistry = elementRegistry;
    this._playbookHandler = playbookHandler;

    // Initialize caches
    this._waypointsCache = new Map();
    this._boundsCache = new Map();
    this._positionCache = new Map();

    this.bindEvents();

    // Clear caches when playbook changes
    this._eventBus.on(['playbook.loaded', 'elements.changed'], () => {
      this.clearAllCaches();
    });
  }

  private clearAllCaches(): void {
    this._waypointsCache.clear();
    this._boundsCache.clear();
    this._positionCache.clear();
  }

  bindEvents(): void {
    this._eventBus.on('autoPlace', (event: any) => {
      const { shape, source } = event;
      return this.getNextShapePosition(source, shape);
    });
  }

  /**
   * this method handles the autoPlace
   * It creates the new shapes with a calculated position. This position will come form the extension if it exist
   * It connect the two shapes with the provided connectionType
   */
  appendShape(
    source: ShapeLike,
    shape: ShapeLike,
    connection: Partial<Connection>,
  ): ShapeLike {
    let initialPosition: Point | undefined;

    const coordinatesExtension = this._playbookHandler.getCoordinatesExtension(shape.id);
    if (coordinatesExtension?.x && coordinatesExtension?.y) {
      initialPosition = {
        x: coordinatesExtension.x,
        y: coordinatesExtension.y,
      };
    }

    if (!initialPosition) {
      initialPosition = this.getNextShapePosition(source as Shape, shape as Shape);
    }

    const newShape = this._modeling.appendShape(
      source as any,
      shape,
      initialPosition,
      source.parent,
      connection,
    );

    return newShape;
  }

  /**
   * this method return a position available on the canvas for the provided shape
   */
  getFirstShapePosition(shape: Shape): Point {
    let initialPosition: Point | undefined;

    const coordinatesExtension = this._playbookHandler.getCoordinatesExtension(shape.id);
    if (coordinatesExtension?.x && coordinatesExtension?.y) {
      initialPosition = {
        x: coordinatesExtension.x,
        y: coordinatesExtension.y,
      };
    }

    if (!initialPosition) {
      initialPosition = {
        x: 300,
        y: window.screen.height / 2 - shape.height / 2,
      };
    }

    return this.getValidShapePosition(shape, initialPosition);
  }

  /**
   * Get connection waypoints from coordinates extension or cache
   */
  getConnectionWaypoints(
    stepId: string,
    nextStepId: string,
    connectionType: CacaoConnectionType,
  ): Point[] {
    const cacheKey = `${stepId}_${nextStepId}_${connectionType}`;
    
    if (!this._waypointsCache.has(cacheKey)) {
      try {
        const workflowStep = this._playbookHandler.playbook.workflow[stepId];
        if (!workflowStep) {
          this._waypointsCache.set(cacheKey, []);
          return [];
        }

        const coordinateExtension = this._playbookHandler.getCoordinatesExtension(stepId);
        if (!coordinateExtension) {
          this._waypointsCache.set(cacheKey, []);
          return [];
        }

        const convertInWaypoints = (connectionExtension: ConnectionExtension): Point[] => {
          return connectionExtension.x.map((x, index) => ({
            x,
            y: connectionExtension.y[index],
          }));
        };

        for (const connectionExtension of coordinateExtension.outgoing_connections) {
          if (connectionExtension.type === connectionType) {
            let waypoints: Point[] = [];
            
            const connType = connectionExtension.type as ValidConnectionTypes;
            switch (connType) {
              case 'cases': {
                const casesExt = connectionExtension as CasesConnectionExtension;
                if ((workflowStep as SwitchConditionStep)?.cases[casesExt.case] === nextStepId) {
                  waypoints = convertInWaypoints(connectionExtension);
                }
                break;
              }
              case 'next-steps': {
                const parallelExt = connectionExtension as NextStepsConnectionExtension;
                if (parallelExt.next_step === nextStepId) {
                  waypoints = convertInWaypoints(connectionExtension);
                }
                break;
              }
              default:
                waypoints = convertInWaypoints(connectionExtension);
                break;
            }

            if (waypoints.length > 0) {
              this._waypointsCache.set(cacheKey, waypoints);
              return waypoints;
            }
          }
        }

        this._waypointsCache.set(cacheKey, []);
      } catch (error) {
        console.debug('Error getting connection waypoints:', error);
        this._waypointsCache.set(cacheKey, []);
      }
    }

    return this._waypointsCache.get(cacheKey) || [];
  }

  /**
   * Get next shape position with caching
   */
  private getNextShapePosition(source: Shape, target: Shape): Point {
    const cacheKey = `${source.id}_${target.id}`;
    
    if (!this._positionCache.has(cacheKey)) {
      const sourceTrbl = asTRBL(source);
      const position = {
        x: sourceTrbl.right + this.HORIZONTAL_MARGIN_BETWEEN_SHAPES,
        y: sourceTrbl.top + source.height / 2 - target.height / 2,
      };

      const validPosition = this.getValidShapePosition(target, position);
      this._positionCache.set(cacheKey, validPosition);
    }

    return this._positionCache.get(cacheKey)!;
  }

  /**
   * return a position valid to place the shape
   * @param shape
   * @param position
   * @returns
   */
  private getValidShapePosition(shape: Shape, position: Point): Point {
    const nextPositionDirection = {
      y: this.VERTICAL_MARGIN_BETWEEN_SHAPES,
    };

    while (this.isPositionWithConflicts(shape, position)) {
      position.y += nextPositionDirection.y;
    }

    return position;
  }

  /**
   * return a boolean to say if the shape can be place at the position without any conflict with the existing shape
   * @param shape
   * @param position
   * @returns True if the shape can be place ther, False otherwize
   */
  private isPositionWithConflicts(shape: Shape, position: Point): boolean {
    const bounds = {
      x: position.x - shape.width / 2,
      y: position.y - shape.height / 2,
      width: shape.width,
      height: shape.height,
    };

    const elements = this._elementRegistry.getAll();
    return elements.some(element => {
      if (CacaoUtils.isConstructType(element.type)) {
        const orientation = getOrientation(element as any, bounds, 10) as string;
        return orientation === 'intersect';
      }
      return false;
    });
  }

  /**
   * get bounds for the element and all its children
   * @param element
   * @returns Rect: a bounds
   */
  private getHeritateBounds(element: ElementLike): Rect {
    if (this._boundsCache.has(element.id)) {
      return this._boundsCache.get(element.id)!;
    }

    const bounds = {
      x: element.x - element.width / 2,
      y: element.y - element.height / 2,
      width: element.width,
      height: element.height,
    };

    for (const connection of element.outgoing) {
      const target = connection.target;
      if (target && CacaoUtils.isConstructType(target.type)) {
        const childBounds = this.getHeritateBounds(target);
        
        if (childBounds.x < bounds.x) {
          bounds.width = bounds.x - childBounds.x + bounds.width;
          bounds.x = childBounds.x;
        } else {
          bounds.width = childBounds.x - bounds.x + childBounds.width;
        }

        if (childBounds.y < bounds.y) {
          bounds.height = bounds.y - childBounds.y + bounds.height;
          bounds.y = childBounds.y;
        } else {
          bounds.height = childBounds.y - bounds.y + childBounds.height;
        }
      }
    }

    this._boundsCache.set(element.id, bounds);
    return bounds;
  }
}

CacaoAutoPlace.$inject = [
  'eventBus',
  'modeling',
  'canvas',
  'elementRegistry',
  'playbookHandler',
];
