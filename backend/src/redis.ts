import { Redis } from "@upstash/redis";
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
}
const redis = new Redis({
  url,
  token,
});
const CACHE_TTL = 60 * 60 * 24 * 30;
export const redisClient = redis;
export const setData = async (key: string, value: string) => {
  try {
    await redis.set(key, value, { ex: CACHE_TTL });
  } catch (error) {
    console.error(error);
  }
};
export const getData = async <T>(key: string) => {
  try {
    return (await redis.get(key)) as T;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const pokemonKey = "pokemon:key:";
