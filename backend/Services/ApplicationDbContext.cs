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
        public DbSet<Race> Races { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.Entity<Player>()
                .HasMany(p => p.Races)
                .WithMany(r => r.Players);

            base.OnModelCreating(modelBuilder);
        }

    }
}