using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models {
    public class PlayerMatch {
        public int Id {get; set;}
        public int PlayerId { get; set; }
        public Player Player { get; set; } = null!;
        public int MatchIndex { get; set; }
        public string MatchJson { get; set; } = null!;
    }
}