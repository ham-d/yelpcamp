var express = require("express");
//mergeParams merges params from parent(campgrounds) and child(comments) together
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
//if no file is passed in, index.js will be passed in by default
var middleware = require("../middleware");

//coments new(form)
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

//comments create
router.post("/", middleware.isLoggedIn, function(req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err);
            res.render("/campgrounds");
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment) {
                if(err){
                    req.flash("error", "comment could not be added");
                    res.redirect("/campgrounds");
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment + connect new comment to campground
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment!");
                    //redirect campground show page
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwner, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

//COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwner, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwner, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;