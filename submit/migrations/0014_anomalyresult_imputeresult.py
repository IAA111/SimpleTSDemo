# Generated by Django 4.1 on 2024-03-27 06:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("submit", "0013_predictresult_is_anomaly"),
    ]

    operations = [
        migrations.CreateModel(
            name="AnomalyResult",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("time", models.CharField(max_length=24)),
                ("variable", models.IntegerField()),
                ("true_value", models.FloatField()),
                ("predict_value", models.FloatField()),
                ("analysis", models.CharField(default="", max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="ImputeResult",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("time", models.CharField(max_length=24)),
                ("variable", models.IntegerField()),
                ("Imputed_value", models.FloatField()),
            ],
        ),
    ]
