import assert from 'node:assert/strict';
import { test } from 'node:test';
import { confirmVipReward } from '../src/utils/confirmVipReward.ts';

for (const reason of ['missing card', 'fewer than five server stamps']) {
  test(`${reason}: no local update and no success`, async () => {
    let updates = 0;
    const success = await confirmVipReward(async () => null, () => { updates += 1; });
    assert.equal(success, false);
    assert.equal(updates, 0);
  });
}

for (const reason of ['read failed', 'write failed']) {
  test(`${reason}: failure propagates without local update`, async () => {
    let updates = 0;
    const error = new Error(reason);
    await assert.rejects(confirmVipReward(async () => { throw error; }, () => {
      updates += 1;
    }), error);
    assert.equal(updates, 0);
  });
}

test('updates only after server confirmation, using its authoritative values', async () => {
  const confirmed = { stamps: 0, rewardsClaimed: 4, history: [] };
  let resolve;
  const pending = new Promise((done) => { resolve = done; });
  const updates = [];
  const result = confirmVipReward(() => pending, (value) => updates.push(value));
  assert.deepEqual(updates, []);
  resolve(confirmed);
  assert.equal(await result, true);
  assert.deepEqual(updates, [confirmed]);
});
