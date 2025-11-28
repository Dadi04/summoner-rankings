using backend.DTOs;

namespace backend.Utils {
    public static class MatchSortingHelper {
        public static long GetMatchEndUnixTime(LeagueMatchDto? match) {
            if (match?.details?.info == null) {
                return 0;
            }

            var info = match.details.info;
            if (info.gameEndTimestamp > 0) {
                return info.gameEndTimestamp;
            }

            if (info.gameStartTimestamp > 0 && info.gameDuration > 0) {
                return info.gameStartTimestamp + (info.gameDuration * 1000L);
            }

            if (info.gameStartTimestamp > 0) {
                return info.gameStartTimestamp;
            }

            return 0;
        }
    }
}

