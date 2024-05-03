import { Hono } from "hono"
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from "@nimeshthakur/medium-common";

export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string,
      JWT_SECRET: string
    }
    Variables: {
      userId: string
    }  
  }>();

blogRouter.use('/*', async(c,next) => {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.split(" ")[1];

  try{
    const response = await verify(token, c.env.JWT_SECRET);
  
    if(response.id){
      c.set("userId", response.id);
      await next();
    }
    else{
      c.status(403);
      return c.json({error: "unauthorized"});
    }
  }
  catch(e){
    c.status(403);
    return c.json({
      message: "You are not logged in"
    })
  }
})

blogRouter.post('/', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json(); //To get body
  const { success } = createBlogInput.safeParse(body);

    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

  const authorId = c.get("userId");

  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: authorId
    }
  }) 

  return c.json({
    id: blog.id
  })
})

blogRouter.put('/', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json(); //To get body
  const { success } = updateBlogInput.safeParse(body);

    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

  const blog = await prisma.post.update({
    where: {
      id: body.id
    },
    data: {
      title: body.title,
      content: body.content,
    }
  }) 

  return c.json({
    id: blog.id
  })
})

blogRouter.get('/bulk', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.post.findMany({
    select: {
      content: true,
      title: true,
      id: true,
      author: {
        select: {
          name: true
        }
      }
    }
  });

  return c.json({
    blogs
  })
})  

blogRouter.get('/:id', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.req.param("id");

  try{
    const blog = await prisma.post.findFirst({
      where: {
        id: id
      },
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: {
            name: true
          }
        }
      }
    }) 

    return c.json({
      blog
    })
  }
  catch(e){
    c.status(411);
    return c.json({
      message: "Error while fetching blog post"
    });
  }

})