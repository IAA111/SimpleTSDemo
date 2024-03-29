# Generated by Django 4.1 on 2024-03-25 02:32

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("submit", "0004_trainparameters_dataset"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="trainparameters",
            name="predict_data_Batch_size",
        ),
        migrations.RemoveField(
            model_name="trainparameters",
            name="predict_model_choice",
        ),
        migrations.RemoveField(
            model_name="trainparameters",
            name="train_batch_size",
        ),
        migrations.AddField(
            model_name="trainparameters",
            name="imputation_size",
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="trainparameters",
            name="predict_model",
            field=models.TextField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="trainparameters",
            name="predict_window_size",
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="trainparameters",
            name="train_data_size",
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="trainparameters",
            name="dataset",
            field=models.FileField(
                default=0, max_length=128, upload_to="dataset/", verbose_name="dataset"
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="trainparameters",
            name="impute_model",
            field=models.TextField(),
        ),
    ]
