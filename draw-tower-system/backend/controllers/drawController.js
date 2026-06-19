const supabase = require("../config/supabase");

exports.saveProductionEntry = async (req, res) => {
  try {
    const {
      barcode_id,
      preform_id,
      machine,
      operator_name,
      shift,
      product_type,
      fiber_count,
      produced_length,
      production_date,
      production_time,
      remarks,
    } = req.body;

    if (
      !barcode_id ||
      !preform_id ||
      !machine ||
      !operator_name ||
      !shift ||
      !product_type ||
      !fiber_count ||
      !produced_length ||
      !production_date ||
      !production_time
    ) {
      return res.status(400).json({
        message: "Operational Error: Missing mandatory engineering fields.",
      });
    }

    const { data: duplicateCheck } = await supabase
      .from("production_data")
      .select("barcode_id")
      .eq("barcode_id", barcode_id)
      .maybeSingle();

    if (duplicateCheck) {
      return res.status(400).json({
        message: `Validation Failure: Barcode ID '${barcode_id}' already exists in production history tracking.`,
      });
    }

    const { data, error } = await supabase
      .from("production_data")
      .insert([
        {
          barcode_id,
          preform_id,
          machine,
          operator_name,
          shift,
          product_type,
          fiber_count: parseInt(fiber_count),
          produced_length: parseFloat(produced_length),
          production_date,
          production_time,
          remarks: remarks || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "Production data structural record saved completely.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "System Error saving draw data entry.",
      error: error.message,
    });
  }
};

exports.getReportByBarcode = async (req, res) => {
  try {
    const { barcodeId } = req.params;

    if (!barcodeId) {
      return res
        .status(400)
        .json({ message: "Search parameter target Barcode ID is missing." });
    }

    const { data, error } = await supabase
      .from("production_data")
      .select("*")
      .eq("barcode_id", barcodeId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: "No production data records found matching that Barcode ID.",
      });
    }

    return res.status(200).json({ message: "Record located.", data });
  } catch (error) {
    return res.status(500).json({
      message: "System Error pulling report telemetry metrics.",
      error: error.message,
    });
  }
};
