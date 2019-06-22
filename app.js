//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});        // connecting mongoose with our local database....

const itemsSchema={
  name: String
};


const Item=mongoose.model("Item",itemsSchema); 

const buy_food= new Item({                      
  name: "Welcome to your todolist!"
});

const cook_food= new Item({
  name: "Hit the + button to add a new item."
});

const eat_food=new Item({
  name: "<-- Hit this to delete an item."
});

defaultItems=[buy_food,cook_food,eat_food];


const listSchema={
  name:String,
  items:[itemsSchema]
};


const List=mongoose.model("List",listSchema);









const workItems = [];            // No use ....

app.get("/",function(req,res){
  Item.find({},function(err,foundItems){

    if(foundItems.length===0){

      Item.insertMany(defaultItems,function(err){

          if(err){
            console.log(err);
          }
          else{
            console.log("Successfully Added all the items");
          }
          
    });

      res.redirect("/");
    }
   else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

    });
  
});


app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        // creating the new list..
        const list=new List({
          name: customListName,
          items:defaultItems
        });


  list.save();
  res.redirect("/"+customListName);
  }
  else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
   }   
    
  });

});


  

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedId,function(err){
    if(!err){
      console.log("Successfully deleted");
      res.redirect("/");
    }
    
  });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }  
    }); 
  }
  

}); 



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
