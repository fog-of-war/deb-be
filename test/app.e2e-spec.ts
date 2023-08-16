import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/users/dto";
import { CreatePostDto } from "../src/posts/dto";
describe("APP E2E", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // test에서도 ValidationPipe를 사용하기 위해 설정해주기
    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    await app.init();
    await app.listen(5000);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl("http://localhost:5000");
  });
  afterAll(() => {
    app.close();
  });
  /** Auth 테스트 */
  describe("Auth", () => {
    const dto: AuthDto = { email: "test@gmail.com", password: "secret" };
    /** signup 테스트 */
    describe("Sign Up", () => {
      it("shoud throw if email empty", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it("shoud throw if password empty", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it("shoud throw if no body privided", () => {
        return pactum.spec().post("/auth/signup").expectStatus(400);
      });
      it("shoud signup", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto)
          .expectStatus(201);
      });
    });
    /** signin 테스트 */
    describe("Sign in", () => {
      it("shoud throw if email empty", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it("shoud throw if password empty", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it("shoud throw if no body privided", () => {
        return pactum.spec().post("/auth/signin").expectStatus(400);
      });
      it("shoud signin", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody(dto)
          .expectStatus(200)
          .stores("userAt", "access_token");
      });
    });
  });
  /** User 테스트 */
  describe("User", () => {
    describe("Get me", () => {
      it("shoud get current user", () => {
        return pactum
          .spec()
          .get("/users/me")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200);
      });
    });
    describe("Edit user", () => {
      const dto: EditUserDto = { email: "edit@gmail.com", nickname: "edit" };
      it("shoud edit current user", () => {
        return pactum
          .spec()
          .patch("/users/me")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.nickname)
          .expectBodyContains(dto.email);
        // .expectBodyContains("fake");
      });
    });
  });
  /** Post 테스트 */
  let createdPostId; // 생성한 게시물의 ID를 저장할 변수

  describe("Post", () => {
    // describe("Get Empty Posts", () => {
    //   it("should get posts", () => {
    //     return pactum
    //       .spec()
    //       .get("/posts")
    //       .withHeaders({ Authorization: "Bearer $S{userAt}" })
    //       .expectStatus(200)
    //       .expectBody([]);
    //   });
    // });
    describe("Create Post", () => {
      const dto: CreatePostDto = {
        title: "테스트",
        description: "테스트",
        image_url: "http://www.naver.com", // 이미지 URL을 적절하게 수정
        star_rating: 4.5, // 별점 값을 숫자로 수정
      };

      it("should create a post", async () => {
        const response = await pactum
          .spec()
          .post("/posts")
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withJson(dto)
          .expectStatus(201);

        createdPostId = response.body.id; // 생성한 게시물의 ID 저장
        // .inspect();
      });
    });
    describe("Get Posts", () => {
      it("should get posts", async () => {
        return pactum
          .spec()
          .get("/posts")
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .inspect();
      });
    });
    describe("Get Post By Id", () => {
      it("should get a post by id", () => {
        const postId = createdPostId; // 테스트에 사용할 게시물의 ID
        return pactum
          .spec()
          .get(`/posts/${postId}`)
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(200)
          .inspect();
      });
    });
    describe("Edit Post", () => {
      it("should edit a post", () => {
        const updatedData = {
          title: "수정테스트",
          description: "수정테스트",
          star_rating: 4.0,
        }; // 업데이트할 게시물 데이터
        return pactum
          .spec()
          .patch(`/posts/${createdPostId}`)
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .withJson(updatedData)
          .expectStatus(200)
          .inspect();
      });
    });
    describe("Delete Post", () => {
      it("should delete a post", () => {
        return pactum
          .spec()
          .delete(`/posts/${createdPostId}`)
          .withHeaders({ Authorization: "Bearer $S{userAt}" })
          .expectStatus(204)
          .inspect();
      });
    });
  });
  it.todo("shoud pass");
});
