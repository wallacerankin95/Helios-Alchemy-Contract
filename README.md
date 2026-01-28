Overview of Contracts and functions  

***************************************

BuyAndBurn  

overview:  
-receive ETH/TITANX/HLX  
-buy/burn HLX on set amount and time schedule  
-create/manage TITANX/HLX LP  


notes:  
-update variable s_capPerSwapETH = 0.01 ether;   -done

***************************************  

BurnInfo.sol  

overview:  
-tracks burn variables  

notes:  

 
***************************************

GlobalInfo.sol  

overview:  
-daily update  
-global variables/functions  

notes:  


***************************************

Helios.sol  

overview:  
-minting / staking    
-cycle reward pool  

notes:  
-add burn TITANX mint bonus. burn 10% of mining cost in TITANX to earn 10% more shares  --done 
-add burn TITANX staking bonus. burn 10% of stake cost in TITANX to earn 10% more shares  
    example: 10 HLX = 50 TITANX, stake 100 HLX, %10 of stake is 10 HLX, burn 50 TITANX to get full 10% bonus  


***************************************

MintInfo.sol  

overview:  
-minting functions and variables  

notes:  

 
***************************************

OwnerInfo.sol  

overview:  
-owner functions  

notes:  

***************************************

StakeInfo.sol  

overview:  
-staking

notes:  
-add stake bonus for titanx burn -done 

***************************************

Treasury.sol  

overview:  
-stake TITANX  
-claim / distribute ETH rewards  
-buy / burn TITANX  


notes:  
-clone treasury when 1000 stakes reached  
	-Check DragonX treasury staking methods. They solved the 1000 stake limit issue.  
	https://etherscan.io/address/0x96a5399d07896f757bd4c6ef56461f58db951862#code  
-store ETH for TITANX burn pool and have owner function to set eth swap cap and time interval minimum  - done  


***************************************

libs/calcFunctions.sol

overview:  

notes:  

***************************************

libs/Constant.sol

overview:  

notes:  

***************************************

Additional Notes:  

-helios functions that need distribution buttons on frontend:  
	-buy/burn hlx  
	-hlx from mining distribution  
 	-treasury stake  
	-treasury eth distribution  
	-cycle reward payout  

--plz calrify these function a bit didn't understand ! 
