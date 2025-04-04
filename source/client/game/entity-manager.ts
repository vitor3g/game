import { Logger } from "@/common/logger";
import { SString } from "@/shared/shared.utils";
import type { Entity } from "./entity";

export class EntityManager {
  private readonly logger: Logger;
  private readonly entities = new Map<string, Entity<any>>();

  constructor() {
    this.logger = new Logger("dz::entity-manager");
  }

  public start() {
    g_core.getGraphics().getTickManager().subscribe("entity-manager-update", this.updateAll.bind(this));
  }

  public add(entity: Entity<any>): void {
    this.entities.set(entity.id, entity);
    this.logger.log(SString("%s entity added to queue", entity.id));
  }

  public remove(id: string): void {
    this.entities.delete(id);
    this.logger.log(SString("%s entity removed from queue", id));
  }

  public removeEntity(entity: Entity<any>): void {
    this.remove(entity.id);
  }

  public has(id: string): boolean {
    return this.entities.has(id);
  }

  public getById(id: string): Entity<any> | undefined {
    return this.entities.get(id);
  }

  public getByTag(tag: string): Entity<any>[] {
    return Array.from(this.entities.values()).filter((e) => e.hasTag(tag));
  }

  public getByType<T extends Entity<any>>(
    type: new (...args: any[]) => T,
  ): T[] {
    return Array.from(this.entities.values()).filter(
      (e) => e instanceof type,
    ) as T[];
  }

  public getAll(): Entity<any>[] {
    return Array.from(this.entities.values());
  }

  public clear(): void {
    this.entities.clear();
    this.logger.log("All entities cleared.");
  }

  public updateAll(): void {
    for (const entity of this.entities.values()) {
      entity.update();
    }
  }
}
