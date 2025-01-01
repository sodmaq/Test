import {
  Includeable,
  Model,
  ModelStatic,
  OrderItem,
  where,
  WhereOptions,
} from "sequelize";

import { ConflictError, NotFoundError } from "../utils/errors";
import helpers from "../utils/helpers";
import {
  PaginatedResponse,
  ReqQueryOptions,
} from "../interfaces/misc.interface";

class BaseService<T extends Model> {
  constructor(
    private model: ModelStatic<T>,
    private name: string
  ) {}

  public async getAll(
    whereQuery: WhereOptions<T>,
    includeables?: Includeable[]
  ): Promise<T[]> {
    const records: T[] | null = await this.model.findAll({
      where: whereQuery,
      include: includeables,
      order: [["createdAt", "DESC"]],
    });
    return records;
  }

  public async getAllPaginated(
    whereQuery: WhereOptions<T>,
    queryOpts: ReqQueryOptions,
    includeables?: Includeable[]
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, offset } = queryOpts;

    const result = await this.model.findAndCountAll({
      where: whereQuery,
      limit,
      offset,
      include: includeables,
      order: [["createdAt", "DESC"]],
    });

    const paginationData = helpers.getPaginationData(limit, page, result.count);
    return {
      result: result.rows as T[],
      totalCount: result.count,
      ...paginationData,
    };
  }

  public async count(whereQuery: WhereOptions<T>): Promise<number> {
    const count: number = await this.model.count({ where: whereQuery });

    return count;
  }

  public async get(
    whereQuery: WhereOptions<T>,
    includeables?: Includeable[],
    order?: OrderItem[]
  ): Promise<T | null> {
    const record: T | null = await this.model.findOne({
      where: whereQuery,
      include: includeables,
      order,
    });

    return record;
  }

  public async getOrError(
    whereQuery: WhereOptions<T>,
    includeables?: Includeable[]
  ): Promise<T> {
    const record: T | null = await this.model.findOne({
      where: whereQuery,
      include: includeables,
    });

    if (!record) {
      throw new NotFoundError(
        `This ${this.name.toLowerCase()} could not be found.`
      );
    }

    return record as T;
  }

  public async getById(
    id: number | string,
    includeables?: Includeable[]
  ): Promise<T | null> {
    const record: T | null = await this.model.findByPk(id, {
      include: includeables,
    });

    return record;
  }

  public async getByIdOrError(
    id: number | string,
    includeables?: Includeable[]
  ): Promise<T> {
    const record: T | null = await this.model.findByPk(id, {
      include: includeables,
    });

    if (!record) {
      throw new NotFoundError(
        `This ${this.name.toLowerCase()} could not be found.`
      );
    }

    return record;
  }

  public async create(data: Partial<T>, extra?: any): Promise<T> {
    return await this.model.create(data as any);
  }

  public async createOrUpdate(data: Partial<T>, extra?: any): Promise<T> {
    const [instance] = await this.model.upsert(data as any);
    return instance;
  }

  public async delete(whereQuery: WhereOptions<T>): Promise<number> {
    const record = await this.model.destroy({ where: whereQuery });
    return record;
  }

  public async deleteOrError(whereQuery: WhereOptions<T>): Promise<void> {
    const record = await this.model.destroy({ where: whereQuery });

    if (!record) {
      throw new NotFoundError(
        `This ${this.name.toLowerCase()} could not be found.`
      );
    }
  }

  protected async getByFKsOrError(
    whereQuery: WhereOptions<T>
  ): Promise<T | null> {
    const record: T | null = await this.model.findOne({
      where: whereQuery,
    });
    return record;
  }

  protected async validateSlug(
    whereQuery: WhereOptions<T>,
    throwError = true
  ): Promise<T | null> {
    const record: T | null = await this.model.findOne({
      where: whereQuery,
    });

    if (record && throwError) {
      throw new ConflictError(
        `A ${this.name.toLowerCase()} with this name already exists.`
      );
    }

    return record;
  }

  protected generateIncludeable<T extends Model>(
    model: ModelStatic<T>,
    alias: string,
    attributes?: string[],
    where?: WhereOptions<T>,
    includeables?: Includeable[]
  ): Includeable {
    return {
      model,
      as: alias,
      attributes,
      where,
      ...(includeables && { include: includeables }),
    };
  }
}

export default BaseService;
