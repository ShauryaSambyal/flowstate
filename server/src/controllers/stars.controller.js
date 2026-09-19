import { User } from "../models/users.model.js";

const BADGE_THRESHOLD = 100;
const BADGE_NAME = "Flow Master";

/* Reasons the server will accept, with their validation rules. */
const CLAIM_RULES = {
    "photo-challenge": { exact: 10, requiresPhotoHash: true },
    "local-migration": { min: 1, max: 1000, requiresPhotoHash: false, oncePerUser: true },
};

/* A challenge can only ever be rewarded once per user per image. */
function hashPhoto(photoHash) {
    return String(photoHash).trim();
}

function computeBadge(stars) {
    return stars >= BADGE_THRESHOLD ? BADGE_NAME : null;
}

export const getStars = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const stars = user.stars || 0;

        res.status(200).json({
            success: true,
            stars,
            badge: computeBadge(stars),
        });
    } catch (error) {
        console.error("Get Stars Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching stars.",
            error: error.message,
        });
    }
};

export const claimStars = async (req, res) => {
    try {
        const { email, amount, reason, photoHash } = req.body;

        if (!email) {
            return res.status(401).json({ success: false, message: "Sign in to collect stars" });
        }
        if (!reason || !CLAIM_RULES[reason]) {
            return res.status(400).json({ success: false, message: "Invalid claim reason" });
        }

        const rule = CLAIM_RULES[reason];
        const parsedAmount = Number(amount);

        if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be a positive integer" });
        }
        if (rule.exact !== undefined && parsedAmount !== rule.exact) {
            return res.status(400).json({ success: false, message: `This claim awards exactly ${rule.exact} stars` });
        }
        if (rule.min !== undefined && parsedAmount < rule.min) {
            return res.status(400).json({ success: false, message: `Amount must be at least ${rule.min}` });
        }
        if (rule.max !== undefined && parsedAmount > rule.max) {
            return res.status(400).json({ success: false, message: `Amount must not exceed ${rule.max}` });
        }
        if (rule.requiresPhotoHash && !photoHash) {
            return res.status(400).json({ success: false, message: "A photo hash is required for this claim" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // One-time local migration guard
        if (rule.oncePerUser && user.starsMigratedAt) {
            return res.status(200).json({
                success: true,
                awarded: 0,
                stars: user.stars || 0,
                badge: computeBadge(user.stars || 0),
                message: "Local stars already migrated",
            });
        }

        // Idempotency: same image cannot be rewarded twice
        if (rule.requiresPhotoHash) {
            const hash = hashPhoto(photoHash);
            if ((user.claimedChallenges || []).includes(hash)) {
                return res.status(200).json({
                    success: true,
                    awarded: 0,
                    stars: user.stars || 0,
                    badge: computeBadge(user.stars || 0),
                    message: "This challenge has already been rewarded",
                });
            }
            user.claimedChallenges.push(hash);
        }

        user.stars = (user.stars || 0) + parsedAmount;
        user.lastStarClaimAt = new Date();
        if (rule.oncePerUser) user.starsMigratedAt = new Date();
        user.badge = computeBadge(user.stars);
        user.starsHistory.push({
            amount: parsedAmount,
            reason,
            photoHash: rule.requiresPhotoHash ? hashPhoto(photoHash) : null,
            at: new Date(),
        });

        await user.save();

        res.status(200).json({
            success: true,
            awarded: parsedAmount,
            stars: user.stars,
            badge: user.badge,
            message: `+${parsedAmount} stars earned!`,
        });
    } catch (error) {
        console.error("Claim Stars Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while claiming stars.",
            error: error.message,
        });
    }
};