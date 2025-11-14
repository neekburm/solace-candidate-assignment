import db from "../../../db";
import { advocates } from "../../../db/schema";
import { count } from "drizzle-orm";

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;
    
    const dataQuery = db
      .select()
      .from(advocates)
      .limit(limit)
      .offset(offset);

    const totalQuery = db
      .select({ count: count() })
      .from(advocates);

    const [data, total] = await Promise.all([
      dataQuery,
      totalQuery
    ]);

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total: total[0]?.count ?? 0,
        totalPages: Math.ceil((total[0]?.count ?? 0) / limit),
      },
    });
  } 
  catch (error) {
    return Response.json({ error: "Error fetching advocates." }, { status: 500 });
  }
}
