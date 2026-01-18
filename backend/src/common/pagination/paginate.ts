import {ObjectLiteral, SelectQueryBuilder} from 'typeorm';
import {PaginatedResult} from "./pagination.dto";



export async function paginate<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    options: {
        page?: number;
        limit?: number;
        order?: 'asc' | 'desc';
        orderBy?: string;
    } = {},
): Promise<PaginatedResult<T>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const order: 'ASC' | 'DESC' =
        options.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const orderBy = options.orderBy ?? 'id';

    query.orderBy(`${query.alias}.${orderBy}`, order)
        .skip((page - 1) * limit)
        .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
        data,
        total,
        page,
        limit,
    };
}
