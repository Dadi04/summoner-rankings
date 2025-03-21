using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models {
    public class Player {
        public int Id {get; set;}
        public string SummonerName {get; set;} = string.Empty;
        public string SummonerTag {get; set;} = string.Empty;
        public string Region {get; set;} = string.Empty;
        public int ProfileIconId { get; set; }
        public string Rank {get; set;} = string.Empty;
        public int LeaguePoints {get; set;}
        public int Level {get; set;}

        public ICollection<Race> Races { get; set; } = new List<Race>();
    }
}