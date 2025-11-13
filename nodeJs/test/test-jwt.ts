import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// Mock Data
const mockUser = {
    uuid: "550e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
    password: "testpassword123"
};

async function testJWT() {
    console.log("JWT 테스트\n");

    // 1. 비밀번호 해싱
    console.log("1. 비밀번호 해싱");
    const hashedPassword = await bcrypt.hash(mockUser.password, 10);
    console.log(`원본 비밀번호: ${mockUser.password}`);
    console.log(`해싱된 비밀번호: ${hashedPassword}\n`);

    // 2. 비밀번호 검증
    console.log("2. 비밀번호 검증");
    const isValidPassword = await bcrypt.compare(mockUser.password, hashedPassword);
    const isInvalidPassword = await bcrypt.compare("wrongpassword", hashedPassword);
    console.log(`올바른 비밀번호 검증: ${isValidPassword ? "성공" : "실패"}`);
    console.log(`잘못된 비밀번호 검증: ${isInvalidPassword ? "실패" : "성공"}\n`);

    // 3. JWT 토큰 생성
    console.log("3. JWT 토큰 생성");
    const token = jwt.sign(
        { uuid: mockUser.uuid },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );
    console.log(`생성된 JWT 토큰:`);
    console.log(token);
    console.log();

    // 4. JWT 토큰 검증
    console.log("4. JWT 토큰 검증");
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { uuid: string };
        console.log("토큰 검증 성공");
        console.log(`디코딩된 UUID: ${decoded.uuid}`);
        console.log(`원본 UUID와 일치: ${decoded.uuid === mockUser.uuid ? "통과" : "실패"}\n`);
    } catch (error) {
        console.log("토큰 검증 실패:", error);
    }

    // 5. 만료된 토큰 테스트
    console.log("5. 만료된 토큰 테스트");
    const expiredToken = jwt.sign(
        { uuid: mockUser.uuid },
        process.env.JWT_SECRET!,
        { expiresIn: "0s" } // 즉시 만료
    );

    // 1초 대기시킴
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        jwt.verify(expiredToken, process.env.JWT_SECRET!);
        console.log("만료된 토큰이 검증됨 (문제 있음)");
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            console.log("만료된 토큰 검증 실패 (정상 동작)");
        } else {
            console.log("예상치 못한 에러:", error.message);
        }
    }
    console.log();

    // 6. 잘못된 secret으로 검증 테스트
    console.log("6. 잘못된 secret으로 검증 테스트");
    try {
        jwt.verify(token, "wrong-secret");
        console.log("잘못된 secret으로 검증됨 (문제 있음)");
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            console.log("잘못된 secret 검증 실패 (정상 동작)");
        } else {
            console.log("예상치 못한 에러:", error.message);
        }
    }
    console.log();

    // 7. 로그인 테스트
    console.log("7. 전체 로그인 플로우 테스트");
    console.log("------------------------------------------");

    // 회원가입 테스트
    console.log("회원가입 단계:");
    const registeredUser = {
        uuid: mockUser.uuid,
        email: mockUser.email,
        password: await bcrypt.hash(mockUser.password, 10)
    };
    console.log(`사용자 생성됨 (UUID: ${registeredUser.uuid})`);
    console.log();

    // 로그인 테스트
    console.log("로그인 단계:");
    const loginEmail = "test@example.com";
    const loginPassword = "testpassword123";

    console.log(`  입력된 이메일: ${loginEmail}`);
    console.log(`  이메일 일치: ${loginEmail === registeredUser.email ? "통과" : "실패"}`);

    const passwordMatch = await bcrypt.compare(loginPassword, registeredUser.password);
    console.log(`  비밀번호 일치: ${passwordMatch ? "통과" : "실패"}`);

    if (passwordMatch) {
        const loginToken = jwt.sign(
            { uuid: registeredUser.uuid },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );
        console.log(`  로그인 성공! 토큰 발급됨`);
        console.log(`  토큰: ${loginToken.substring(0, 50)}...`);

        // 토큰으로 사용자 인증 테스트
        console.log();
        console.log("토큰 인증 단계:");
        const verified = jwt.verify(loginToken, process.env.JWT_SECRET!) as { uuid: string };
        console.log(`  토큰 검증 성공`);
        console.log(`  인증된 사용자 UUID: ${verified.uuid}`);
    }

    console.log();
    console.log("=== 모든 테스트 완료 ===");
}

testJWT().catch(console.error);
