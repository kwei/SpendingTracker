import { deleteItem, getItems, putItem } from '@/actions/recordActions';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    return Response.json(await putItem(body));
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, message: 'Internal Server Error' });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queryParams = url.searchParams;
    const groupId = queryParams.get('groupId') ?? undefined;
    const email = queryParams.get('email') ?? undefined;
    const startDate = queryParams.get('startDate') ?? undefined;
    const endDate = queryParams.get('endDate') ?? undefined;
    const { data } = await getItems(groupId, email, startDate, endDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, message: 'Internal Server Error' });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const queryParams = url.searchParams;
    const id = queryParams.get('id');
    if (!id) return Response.json({ status: false, message: 'Missing ID' });
    return Response.json(await deleteItem(id));
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, message: 'Internal Server Error' });
  }
}
