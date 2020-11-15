$(function() {
  var h = $(window).height();

  $('#content').css('display','none');
  $('#loader-bg ,#loader').height(h).css('display','block');
});

//10秒たったら強制的にロード画面を非表示
$('#loader').fadeIn().delay(250).fadeOut().queue(function(){
     $(this).html("<div>+U</div>").dequeue();
 }).fadeIn().delay(500).fadeOut().queue(function(){
     $(this).html("<p>このシステムではあなたのステージを判定します。</p>").dequeue();
 }).fadeIn().delay(500).fadeOut().queue(function(){
     $(this).html("<p>更にあなたより上のステージの一片をお見せします。</p>").dequeue();
 }).fadeIn().delay(500).fadeOut().queue(function(){
     stopload();
 });

function stopload(){
  $('#content').css('display','block');
  $('#loader-bg').delay(900).fadeOut(800);
  $('#loader').delay(600).fadeOut(300);
}
