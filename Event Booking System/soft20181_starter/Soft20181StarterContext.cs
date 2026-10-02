using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using soft20181_starter.Models; // Modellerin olduğu namespace

namespace soft20181_starter
{
    public partial class Soft20181StarterContext : DbContext
    {
        public Soft20181StarterContext()
        {
        }

        public Soft20181StarterContext(DbContextOptions<Soft20181StarterContext> options)
            : base(options)
        {
        }

        public DbSet<Event> Events { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Contact> Contacts { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code.
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlite("Data Source=AppDatabase.db");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
