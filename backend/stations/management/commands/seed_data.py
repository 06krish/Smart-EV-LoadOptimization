from django.core.management.base import BaseCommand
from tariffs.models import Tariff
from simulator.services import ChargerSimulatorService

class Command(BaseCommand):
    help = 'Seeds initial Smart EV Load Optimization dataset and demo state'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Time-of-Use Tariffs...")
        Tariff.objects.all().delete()
        Tariff.objects.create(
            name="Night Off-Peak Eco Rate",
            tariff_type="OFF_PEAK",
            price_per_kwh=0.12,
            start_hour=23,
            end_hour=6
        )
        Tariff.objects.create(
            name="Daytime Standard Rate",
            tariff_type="NORMAL",
            price_per_kwh=0.22,
            start_hour=6,
            end_hour=17
        )
        Tariff.objects.create(
            name="Evening Peak Demand Surcharge",
            tariff_type="PEAK",
            price_per_kwh=0.38,
            start_hour=17,
            end_hour=23
        )

        self.stdout.write("Initializing Master Plan 110 kW Charging Station & EV Demo...")
        res = ChargerSimulatorService.setup_master_plan_demo()
        self.stdout.write(self.style.SUCCESS(f"Seeding completed successfully: {res['message']}"))

