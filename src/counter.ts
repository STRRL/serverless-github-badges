interface CounterModel {
  count: number;
}

export async function increaseAndGet(
  identity: string,
  kv: KVNamespace
): Promise<number> {
  let value = ((await kv.get(identity, { type: "json" })) as CounterModel) || {count:0};
  value.count += 1;
  await kv.put(identity, JSON.stringify(value));
  return Promise.resolve(value.count as number);
}
