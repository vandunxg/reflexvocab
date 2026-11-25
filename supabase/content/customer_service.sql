-- Original AI-assisted development content, not official TOEIC material.
-- Apply once in a transaction after seed.sql; conflicts abort instead of overwriting data.
create temporary table customer_service_batch (
  word text primary key, part text not null, definition text not null, gloss text not null,
  collocation text not null, context1 text not null, cloze1 text not null,
  context2 text not null, cloze2 text not null
) on commit drop;

insert into customer_service_batch values
('refund','noun','money returned to a customer after a purchase','tiền hoàn lại','receive a refund',
 'The customer received a refund for the damaged lamp.','The customer received a ___ for the damaged lamp.',
 'The store offered a full refund after the order was cancelled.','The store offered a full ___ after the order was cancelled.'),
('receipt','noun','a document showing that payment was made','biên lai','keep a receipt',
 'Please keep the receipt as proof of payment.','Please keep the ___ as proof of payment.',
 'The cashier printed a receipt for the purchase.','The cashier printed a ___ for the purchase.'),
('warranty','noun','a promise to repair or replace a product under stated conditions','bảo hành','product warranty',
 'The warranty covers repairs for one year.','The ___ covers repairs for one year.',
 'The manufacturer extended the warranty by six months.','The manufacturer extended the ___ by six months.'),
('complaint','noun','a statement that someone is unhappy about a problem','lời phàn nàn','file a complaint',
 'The manager responded to a complaint about the slow service.','The manager responded to a ___ about the slow service.',
 'A customer filed a complaint about the missing item.','A customer filed a ___ about the missing item.'),
('inquiry','noun','a request for information','yêu cầu thông tin','answer an inquiry',
 'The agent answered an inquiry about store hours.','The agent answered an ___ about store hours.',
 'We received an inquiry about the delivery options.','We received an ___ about the delivery options.'),
('replacement','noun','an item provided in place of another item','hàng thay thế','send a replacement',
 'The company sent a replacement for the broken part.','The company sent a ___ for the broken part.',
 'A replacement will arrive after the faulty printer is returned.','A ___ will arrive after the faulty printer is returned.'),
('discount','noun','a reduction in the usual price','giảm giá','offer a discount',
 'Members receive a discount on their first purchase.','Members receive a ___ on their first purchase.',
 'The shop offered a discount because the box was damaged.','The shop offered a ___ because the box was damaged.'),
('exchange','noun','the act of returning an item and receiving another instead','việc đổi hàng','request an exchange',
 'The customer requested an exchange for a larger jacket.','The customer requested an ___ for a larger jacket.',
 'The store allows an exchange within thirty days.','The store allows an ___ within thirty days.'),
('subscription','noun','an arrangement to receive a service regularly, often for a fee','gói đăng ký','renew a subscription',
 'Her magazine subscription ends in June.','Her magazine ___ ends in June.',
 'The software subscription includes technical support.','The software ___ includes technical support.'),
('representative','noun','a person who acts or speaks for a company','nhân viên đại diện','customer service representative',
 'A representative answered the customer’s question.','A ___ answered the customer’s question.',
 'The company sent a representative to meet the client.','The company sent a ___ to meet the client.'),
('policy','noun','a set of rules adopted by an organization','chính sách','return policy',
 'The return policy allows unused items to be returned within thirty days.','The return ___ allows unused items to be returned within thirty days.',
 'Our privacy policy explains how customer information is used.','Our privacy ___ explains how customer information is used.'),
('feedback','noun','comments about an experience that can help improve it','ý kiến phản hồi','collect feedback',
 'The restaurant asked guests for feedback about their meals.','The restaurant asked guests for ___ about their meals.',
 'Customer feedback helped the team improve the website.','Customer ___ helped the team improve the website.'),
('satisfaction','noun','the feeling of being pleased with an experience','sự hài lòng','customer satisfaction',
 'The survey measures customer satisfaction with the service.','The survey measures customer ___ with the service.',
 'Faster delivery improved satisfaction among shoppers.','Faster delivery improved ___ among shoppers.'),
('delivery','noun','the act of bringing goods to a destination','việc giao hàng','schedule a delivery',
 'The delivery of the furniture is scheduled for Friday.','The ___ of the furniture is scheduled for Friday.',
 'Free delivery is available for orders over fifty dollars.','Free ___ is available for orders over fifty dollars.'),
('invoice','noun','a document listing goods or services and the amount owed','hóa đơn thanh toán','send an invoice',
 'The supplier sent an invoice for the office chairs.','The supplier sent an ___ for the office chairs.',
 'Please check the invoice before paying the contractor.','Please check the ___ before paying the contractor.'),
('appointment','noun','an arrangement to meet someone at a particular time','cuộc hẹn','make an appointment',
 'She made an appointment to discuss her account.','She made an ___ to discuss her account.',
 'Your dental appointment is scheduled for Tuesday.','Your dental ___ is scheduled for Tuesday.'),
('availability','noun','the state of being able to be obtained or used','tình trạng sẵn có','check availability',
 'Please check the availability of the blue shirt.','Please check the ___ of the blue shirt.',
 'Room availability changes during the holiday season.','Room ___ changes during the holiday season.'),
('assistance','noun','help given to someone','sự hỗ trợ','request assistance',
 'Please ask a staff member if you need assistance.','Please ask a staff member if you need ___.',
 'The passenger requested assistance with her luggage.','The passenger requested ___ with her luggage.'),
('courtesy','noun','polite and considerate behavior','sự lịch sự','show courtesy',
 'The agent treated the caller with courtesy.','The agent treated the caller with ___.',
 'Staff should show courtesy when answering questions.','Staff should show ___ when answering questions.'),
('inventory','noun','the goods a business has available','hàng tồn kho','check inventory',
 'The clerk checked the inventory for the requested size.','The clerk checked the ___ for the requested size.',
 'The warehouse inventory includes spare printer parts.','The warehouse ___ includes spare printer parts.');

insert into public.curriculum_lessons (id, topic_id, title, position)
values ('customer-service-core', 'office-basics', 'Customer service essentials', 2);

insert into public.vocabulary_senses
  (id, lesson_id, headword, part_of_speech, definition, vi_gloss, collocations, version)
select 'customer-service-' || word, 'customer-service-core', word, part, definition, gloss, array[collocation], 1
from customer_service_batch;

insert into public.vocabulary_contexts (sense_id, id, example)
select 'customer-service-' || word, 'situation-one', context1 from customer_service_batch
union all
select 'customer-service-' || word, 'situation-two', context2 from customer_service_batch;

insert into public.exercises (id, sense_id, context_id, kind, prompt, explanation, version, payload)
select 'customer-service-' || word || '-one', 'customer-service-' || word,
  'situation-one', 'typing-cloze'::public.exercise_kind, cloze1, definition, 1,
  jsonb_build_object('acceptedAnswers', jsonb_build_array(word))
from customer_service_batch
union all
select 'customer-service-' || word || '-two', 'customer-service-' || word,
  'situation-two', 'typing-cloze'::public.exercise_kind, cloze2, definition, 1,
  jsonb_build_object('acceptedAnswers', jsonb_build_array(word))
from customer_service_batch;

do $$ begin
  if (select count(*) from customer_service_batch) <> 20
    or exists (select 1 from customer_service_batch
      where position('___' in cloze1) = 0 or position('___' in cloze2) = 0)
  then raise exception 'Customer service batch validation failed'; end if;
end $$;
