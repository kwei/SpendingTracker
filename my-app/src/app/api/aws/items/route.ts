import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    return fetch(`${process.env.AWS_API_GATEWAY_URL}/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Internal Server Error' });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queryParams = url.searchParams;
    const groupId = queryParams.get('groupId');
    const email = queryParams.get('email');
    const time = queryParams.get('time');
    if (groupId) {
      const data = await fetch(
        `${process.env.AWS_API_GATEWAY_URL}/items/id/${groupId}${time ? `?time=${time}` : ''}`,
        {
          method: 'GET',
        },
      )
        .then((res) => res.json())
        .then((res) => res.sort(sortData));
      return NextResponse.json(data);
    }
    if (email) {
      const data = await fetch(
        `${process.env.AWS_API_GATEWAY_URL}/items/user/${email}${time ? `?time=${time}` : ''}`,
        {
          method: 'GET',
        },
      )
        .then((res) => res.json())
        .then((res: SpendingRecord[]) => res.sort(sortData))
        .then((res) => res.filter((d) => !d.groupId || d.groupId === ''));
      return NextResponse.json(data);
    }
    const data = await fetch(`${process.env.AWS_API_GATEWAY_URL}/items`, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => res.sort(sortData));
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Internal Server Error' });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const queryParams = url.searchParams;
    const id = queryParams.get('id');
    return await fetch(`${process.env.AWS_API_GATEWAY_URL}/items/id/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Internal Server Error' });
  }
}

const sortData = (a: SpendingRecord, b: SpendingRecord) => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
};
