import "dotenv/config";
function required(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
export const config = {
    port: Number(process.env.PORT ?? 3000),
    db: {
        host: process.env.DB_HOST ?? "127.0.0.1",
        port: Number(process.env.DB_PORT ?? 3306),
        user: required("DB_USER"),
        password: required("DB_PASSWORD"),
        database: required("DB_NAME"),
    },
    jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
};
//# sourceMappingURL=index.js.map