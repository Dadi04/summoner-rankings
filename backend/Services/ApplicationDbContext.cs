using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services {
    public class ApplicationDbContext : DbContext {
        public ApplicationDbContext(DbContextOptions options) : base(options) {}

        public DbSet<Player> Players { get; set; } = null!;
        public DbSet<PlayerBasicInfo> PlayersBasicInfo { get; set; } = null!;
        public DbSet<PlayerMatch> PlayerMatches { get; set; }
        public DbSet<Race> Races { get; set; } = null!;
        public DbSet<User> Users { get; set; }
        public DbSet<RacePlayer> RacePlayers { get; set; }
        public DbSet<Favorite> Favorites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RacePlayer>()
                .HasKey(rp => new { rp.RaceId, rp.PlayerId });
            modelBuilder.Entity<RacePlayer>()
                .HasOne(rp => rp.Race)
                .WithMany(r => r.RacePlayers)
                .HasForeignKey(rp => rp.RaceId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<RacePlayer>()
                .HasOne(rp => rp.Player)
                .WithMany(r => r.RacePlayers)
                .HasForeignKey(rp => rp.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Race>()
                .HasOne(r => r.User)
                .WithMany(u => u.Races)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Player>().HasIndex(p => p.Puuid);
            modelBuilder.Entity<Race>().HasIndex(r => new { r.UserId, r.IsPublic });
            modelBuilder.Entity<RacePlayer>().HasIndex(rp => rp.PlayerId);

            modelBuilder.Entity<PlayerMatch>()
                .HasIndex(pm => new { pm.PlayerId, pm.MatchIndex })
                .HasDatabaseName("IX_PlayerMatches_PlayerId_MatchIndex");
            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.SummonerName, f.Region })
                .IsUnique();
        }

    }
}