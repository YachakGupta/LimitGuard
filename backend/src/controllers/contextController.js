import Context from "../models/contextModel.js";
import { analyzeContextService } from "../services/context.service.js";
import ErrorHandler from "../middlewares/error.js"
import {asyncHandler} from "../middlewares/asyncHandler.js";

export const analyseContext = asyncHandler(async(req,res,next)=>{
  const {text}=req.body;

  if(typeof text!=="string" || !text.trim()){
    return next(new ErrorHandler("Please provide valid, non-empty text to analyze.", 400));

  }
  const context=await analyzeContextService(text);

    return res.status(201).json({
      success:true,
      message:"Context received successfully. AI analysis is pending.",
      data:context
    })

});

export const getAllContexts = asyncHandler(async (req, res) => {
      const contexts = await Context.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: contexts.length,
        data: contexts,
      });
});

