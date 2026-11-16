import type { UserLoyaltyProfile } from '../types';

type ConfirmedLoyalty = Pick<UserLoyaltyProfile, 'stamps' | 'rewardsClaimed' | 'history'>;

// A rejected or ineligible server redemption must never become a local-only success.
export async function confirmVipReward(
  redeem: () => Promise<ConfirmedLoyalty | null>,
  onConfirmed: (loyalty: ConfirmedLoyalty) => void,
): Promise<boolean> {
  const redeemed = await redeem();

  if (!redeemed) return false;

  onConfirmed({
    stamps: redeemed.stamps,
    rewardsClaimed: redeemed.rewardsClaimed,
    history: redeemed.history,
  });

  return true;
}
